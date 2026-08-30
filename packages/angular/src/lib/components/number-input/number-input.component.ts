import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  isDevMode,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';

import {
  createAnnouncer,
  createPressRepeat,
  clampDecimal,
  formatNumber,
  losesPrecision,
  parseNumber,
  rawNumberText,
  resolveNumberFormat,
  settleNumber,
  speakNumber,
  stepDecimal,
  toDecimal,
  uniqueId,
  visuallyHidden,
  type UniNumberPreset,
  type UniNumberRejectReason,
  type UniRoundingMode,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniIconComponent } from '../icon/icon.component';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import type { UniInputBoxOptions } from '../input-box/input-box.model';
import type {
  UniNumberInputOptions,
  UniNumberRejection,
  UniNumberStepped,
} from './number-input.model';

/**
 * Numeric field with locale-aware parsing, `Intl` formatting on commit,
 * prefix/suffix adornments and steppers that hold to repeat.
 *
 * Not `<input type="number">`, and the first reason is a data-loss bug: per the
 * HTML value sanitization algorithm, a number input whose text is not a valid
 * floating-point number reports `value === ''`. Type `12,50` as most of Europe
 * does, or paste `1,234.56` from a spreadsheet, and the app reads an empty
 * field. This is `type="text"` with `role="spinbutton"`, which is the only way
 * to keep the user's malformed text on screen and tell them about it.
 *
 * Chrome comes from `uni-input-box`, so error, disabled and focus states match
 * every other field. All arithmetic runs on the cdk's exact decimal helpers.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-number-input, NumberInput',
  imports: [NgTemplateOutlet, UniIconComponent, UniInputBoxComponent],
  templateUrl: './number-input.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'numberInput' }],
  host: { '[class]': 'className()' },
})
export class UniNumberInputComponent
  extends BaseComponent<UniNumberInputOptions>
  implements FormValueControl<number | null>
{
  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  readonly value = model<number | null>(null);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  /**
   * Exact binding, as a canonical decimal string. Bind this instead of `value`
   * where a cent in the fifth decimal place matters; both stay in sync, so it
   * is a one-word change from the ordinary case.
   */
  readonly valueAsString = model<string | null>(null);

  // --- Configuration -------------------------------------------------------
  /** Accessible name, e.g. "Unit price". */
  label = input.required<string>();
  placeholder = input<string>();
  preset = input<UniNumberPreset>('decimal');
  /** ISO 4217 code, e.g. `'USD'`. Implies `preset="currency"`. */
  currency = input<string>();
  /** BCP 47 tag. Defaults to the document language, then the browser's. */
  locale = input<string>();
  /** Static adornment before the number, e.g. `'$'`. Never parseable input. */
  prefix = input<string>();
  /** Static adornment after the number, e.g. `'kg'`, `'/mo'`. */
  suffix = input<string>();
  decimals = input<number | [min: number, max: number]>();
  grouping = input<'auto' | 'always' | 'min2' | false>();
  /** Escape hatch, merged over the preset. */
  numberFormat = input<Intl.NumberFormatOptions>();
  roundingMode = input<UniRoundingMode>('half-up');
  align = input<'start' | 'end' | 'center'>();
  /** The model is a fraction: `0.15` displays as `15%`. */
  valueIsFraction = input(false);
  /** Spoken long form of an abbreviated suffix, e.g. `'kilograms'` for `kg`. */
  unitAnnouncement = input<string>();
  readOnly = input(false);
  /** Renders without its own input-box chrome, for composers like uni-slider. */
  embedded = input(false);

  // --- Range and stepping --------------------------------------------------
  min = input<number | undefined>();
  max = input<number | undefined>();
  step = input(1);
  /** `PageUp`/`PageDown` and `Shift+Arrow`. Default: `step × 10`. */
  largeStep = input<number>();
  /** `Alt+Arrow`, Figma's fine-nudge convention. Unset disables it. */
  smallStep = input<number>();
  stepOrigin = input<'min' | 'zero'>('min');
  /** Cyclic fields only — 23 → 0 hours, 359 → 0 degrees. */
  wrap = input(false);
  /** `false` refuses an out-of-range commit instead of clamping it. */
  clampOnCommit = input(true);
  /** What ↑ commits on an empty field. Default: `min ?? 0`. */
  emptyStepValue = input<number>();

  // --- Entry behaviour -----------------------------------------------------
  commitOnBlur = input(true);
  selectOnFocus = input(false);
  /** `12*3` → 36. Off by default: a parser in a form field is a real cost. */
  allowExpressions = input(false);
  /** Scroll-to-step. Off by default — see `onWheel`. */
  wheel = input(false);
  repeat = input(true);
  /** Custom parser, replacing the built-in locale parsing. */
  parse = input<(raw: string, locale: string) => string | null>();
  /** Overrides the themed layout for this instance. */
  stepperLayout = input<UniNumberInputOptions['stepperLayout']>();

  // --- Events --------------------------------------------------------------
  stepped = output<UniNumberStepped>();
  /** A commit was refused; the raw text stays in the field. */
  rejected = output<UniNumberRejection>();

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('field');

  protected readonly srOnly = css(visuallyHidden);
  /** Clamps, fences, rejections and expression results are otherwise silent. */
  protected readonly announcer = createAnnouncer();
  protected readonly hintId = uniqueId('uni-number-input-hint');

  /** Uncommitted text. `null` means "show the committed value". */
  private readonly draft = signal<string | null>(null);
  /** A commit that failed — styles the field until the text is edited. */
  protected readonly draftInvalid = signal(false);
  protected readonly focused = signal(false);

  /**
   * The canonical decimal behind both models — the field's source of truth.
   *
   * Two models that each accept writes need a rule for which one won, and
   * "whichever the app touched last" is the only one that does not surprise
   * somebody. A `linkedSignal` over both gives us that: the model whose value
   * differs from the previous source is the one that changed.
   *
   * The subtlety is the echo. Committing writes both models, and the `value`
   * projection of a 17-digit exact string is lossy — so on the next pass
   * `value` looks changed, and naively adopting it would clobber the very
   * precision `valueAsString` exists to keep. A changed `value` that already
   * matches `Number(exact)` is our own projection coming back, not a write.
   */
  private readonly canonical = linkedSignal<
    { value: number | null; exact: string | null },
    string | null
  >({
    source: () => ({ value: this.value(), exact: this.valueAsString() }),
    computation: (source, previous) => {
      const prior = previous?.source;

      if (prior && source.exact !== prior.exact) return source.exact;

      if (prior && source.value !== prior.value) {
        if (source.exact != null && Number(source.exact) === source.value) return source.exact;
        return source.value == null ? null : toDecimal(source.value);
      }

      if (source.exact != null) return source.exact;
      return source.value == null ? null : toDecimal(source.value);
    },
  });

  constructor() {
    super();

    // A hybrid device can gain or lose a coarse pointer mid-session.
    if (typeof matchMedia === 'function') {
      const query = matchMedia('(pointer: coarse)');
      const onChange = () => this.coarsePointer.set(query.matches);
      query.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
    }

    // Keep both models reflecting the source of truth, so an app that binds
    // only one of them still reads a consistent value from the other.
    effect(() => {
      const canonical = this.canonical();
      untracked(() => {
        if (this.valueAsString() !== canonical) this.valueAsString.set(canonical);
        const projected = canonical == null ? null : Number(canonical);
        if (this.value() !== projected) this.value.set(projected);
      });
    });

    // Silent precision loss is the whole reason `valueAsString` exists, so it
    // is worth saying out loud — once, in dev, per offending value.
    if (isDevMode()) {
      let warned: string | null = null;
      effect(() => {
        const exact = this.valueAsString();
        const value = this.value();
        const subject = exact ?? value;
        if (subject == null) return;
        const key = String(subject);
        if (key === warned || !losesPrecision(subject)) return;
        warned = key;
        console.warn(
          `[uni-number-input] "${this.label()}": ${key} cannot round-trip through a JavaScript number. ` +
            'Bind [(valueAsString)] instead of [(value)] to keep it exact.'
        );
      });
    }
  }

  // --- Format resolution ----------------------------------------------------

  protected readonly resolvedLocale = computed(
    () => this.locale() ?? (document.documentElement.lang || navigator.language || 'en-US')
  );

  protected readonly format = computed(() =>
    resolveNumberFormat({
      preset: this.preset(),
      currency: this.currency(),
      locale: this.resolvedLocale(),
      decimals: this.decimals(),
      grouping: this.grouping(),
      prefix: this.prefix(),
      suffix: this.suffix(),
      roundingMode: this.roundingMode(),
      valueIsFraction: this.valueIsFraction(),
      numberFormat: this.numberFormat(),
      min: this.min(),
      unitAnnouncement: this.unitAnnouncement(),
    })
  );

  /**
   * Two stacked arrows cannot both be 24px tall inside a 32px field, so on a
   * coarse pointer the stacked layout becomes `split`, where each button is a
   * full-height square and clears the WCAG 2.2 SC 2.5.8 floor. Two 12px
   * targets under a fingertip is a coin toss.
   */
  private readonly coarsePointer = signal(
    typeof matchMedia === 'function' ? matchMedia('(pointer: coarse)').matches : false
  );

  protected readonly layout = computed(() => {
    const requested = this.stepperLayout() ?? this.componentOptions().stepperLayout ?? 'stacked';
    return requested === 'stacked' && this.coarsePointer() ? 'split' : requested;
  });

  protected readonly showSteppers = computed(
    () => this.layout() !== 'none' && !this.readOnly()
  );

  protected readonly showError = computed(
    () => (this.invalid() && (this.touched() || this.dirty())) || this.draftInvalid()
  );

  /** Raw while focused, formatted once committed — no caret arithmetic ever. */
  protected readonly displayText = computed(() => {
    const draft = this.draft();
    if (draft != null) return draft;

    const canonical = this.canonical();
    if (canonical == null) return '';
    return this.focused()
      ? rawNumberText(canonical, this.format())
      : formatNumber(canonical, this.format());
  });

  protected readonly valueTextForAria = computed(() =>
    speakNumber(this.canonical(), this.format())
  );

  /**
   * `aria-valuenow` is omitted entirely on an empty field, per APG — a
   * spinbutton reporting 0 for "nothing yet" is a wrong answer, not a missing
   * one. `aria-valuetext` carries the localized "Empty" instead.
   */
  protected readonly canonicalForAria = computed(() => this.canonical() ?? null);

  protected readonly describedBy = computed(() =>
    [this.ariaDescribedBy(), this.hintId].filter(Boolean).join(' ')
  );

  // --- Fences ---------------------------------------------------------------

  private atFence(which: 'min' | 'max'): boolean {
    const bound = which === 'min' ? this.min() : this.max();
    const canonical = this.canonical();
    if (bound == null || canonical == null) return false;
    const clamped = clampDecimal(canonical, this.min(), this.max());
    if (clamped.hit === which) return true;
    return which === 'min'
      ? Number(canonical) <= bound
      : Number(canonical) >= bound;
  }

  protected readonly atMin = computed(() => this.atFence('min') && !this.wrap());
  protected readonly atMax = computed(() => this.atFence('max') && !this.wrap());

  // --- Committing -----------------------------------------------------------

  /** Set the source of truth; the constructor's effect pushes it to both models. */
  private write(canonical: string | null): void {
    this.canonical.set(canonical);
  }

  /**
   * Turn the draft into a value. Out-of-range either clamps (announced) or is
   * refused, per `clampOnCommit`; unreadable text stays in the field, flagged.
   */
  protected commitDraft(): void {
    const draft = this.draft();
    if (draft == null) return;

    const custom = this.parse();
    if (custom) {
      const parsed = custom(draft, this.resolvedLocale());
      if (parsed == null) return this.reject(draft, 'unparseable');
      return this.acceptValue(parsed, false);
    }

    const result = parseNumber(draft, this.format(), {
      allowExpressions: this.allowExpressions(),
      currency: this.currency(),
    });

    if (result.status === 'empty') {
      this.draft.set(null);
      this.draftInvalid.set(false);
      this.write(null);
      return;
    }
    if (result.status === 'error') return this.reject(draft, result.reason);

    this.acceptValue(result.value, result.viaExpression);
  }

  private acceptValue(parsed: string, viaExpression: boolean): void {
    const settled = settleNumber(parsed, this.format());
    const clamped = clampDecimal(settled, this.min(), this.max());

    if (clamped.hit && !this.clampOnCommit()) {
      return this.reject(this.draft() ?? settled, clamped.hit);
    }

    this.draft.set(null);
    this.draftInvalid.set(false);
    this.write(clamped.value);

    if (clamped.hit) {
      const bound = clamped.hit === 'min' ? this.min() : this.max();
      this.announcer.announce(
        `${clamped.hit === 'min' ? 'Minimum' : 'Maximum'} is ${bound}. Value set to ${bound}.`
      );
    } else if (viaExpression) {
      this.announcer.announce(`${formatNumber(clamped.value, this.format())}.`);
    }
  }

  private reject(raw: string, reason: UniNumberRejectReason): void {
    this.draftInvalid.set(true);
    this.rejected.emit({ raw, reason });
    this.announcer.announce(this.rejectionMessage(raw, reason));
  }

  private rejectionMessage(raw: string, reason: UniNumberRejectReason): string {
    switch (reason) {
      case 'min':
        return `${raw} is below the minimum of ${this.min()}.`;
      case 'max':
        return `${raw} is above the maximum of ${this.max()}.`;
      case 'not-integer':
        return `${raw} must be a whole number.`;
      default:
        return `${raw} is not a number.`;
    }
  }

  // --- Stepping -------------------------------------------------------------

  private stepSize(magnitude: 'small' | 'normal' | 'large'): number | null {
    if (magnitude === 'normal') return this.step();
    if (magnitude === 'large') return this.largeStep() ?? this.step() * 10;
    return this.smallStep() ?? null;
  }

  /**
   * Apply one step. An empty field commits `emptyStepValue ?? min ?? 0`, so ↑
   * on a blank quantity gives 1 rather than NaN.
   */
  protected applyStep(
    direction: 1 | -1,
    magnitude: 'small' | 'normal' | 'large' = 'normal',
    announce = true
  ): void {
    if (this.disabled() || this.readOnly()) return;

    const size = this.stepSize(magnitude);
    if (size == null) return;

    // Type-then-step should step from what is on screen, not what was committed.
    if (this.draft() != null) this.commitDraft();
    if (this.draftInvalid()) return;

    const from = this.value();
    const current = this.canonical();

    if (current == null) {
      const seed = toDecimal(this.emptyStepValue() ?? this.min() ?? 0);
      this.write(seed);
      this.stepped.emit({ from, to: Number(seed), by: 0 });
      if (announce) this.announceValue();
      return;
    }

    const next = stepDecimal(current, direction, {
      step: size,
      min: this.min(),
      max: this.max(),
      stepOrigin: this.stepOrigin(),
      wrap: this.wrap(),
    });

    if (next === current) {
      if (announce) this.announceFence(direction);
      return;
    }

    this.write(next);
    this.stepped.emit({ from, to: Number(next), by: Number(next) - (from ?? 0) });
    if (announce) this.announceValue();
  }

  private announceValue(): void {
    this.announcer.announce(`${speakNumber(this.canonical(), this.format())}.`);
  }

  private announceFence(direction: 1 | -1): void {
    const bound = direction > 0 ? this.max() : this.min();
    if (bound == null) return;
    this.announcer.announce(`${direction > 0 ? 'Maximum' : 'Minimum'}, ${bound}.`);
  }

  // --- Hold to repeat -------------------------------------------------------

  private readonly repeatTiming = () => {
    const options = this.componentOptions();
    return {
      delayMs: options.repeatDelayMs,
      intervalMs: options.repeatIntervalMs,
      fastIntervalMs: options.repeatFastIntervalMs,
      rampMs: options.repeatRampMs,
    };
  };

  /**
   * The live region announces on release only — a screen reader narrating two
   * hundred intermediate values is a denial of service.
   */
  protected readonly increment = createPressRepeat({
    onStep: () => this.applyStep(1, 'normal', false),
    onRelease: () => this.announceValue(),
    disabled: () => this.disabled() || this.readOnly() || this.atMax(),
    repeat: () => this.repeat(),
    // A native spinner leaves focus in its field; without this the arrow keys
    // go dead the moment you click a stepper.
    focus: () => this.inputRef().nativeElement.focus(),
    timing: this.repeatTiming,
  });

  protected readonly decrement = createPressRepeat({
    onStep: () => this.applyStep(-1, 'normal', false),
    onRelease: () => this.announceValue(),
    disabled: () => this.disabled() || this.readOnly() || this.atMin(),
    repeat: () => this.repeat(),
    // A native spinner leaves focus in its field; without this the arrow keys
    // go dead the moment you click a stepper.
    focus: () => this.inputRef().nativeElement.focus(),
    timing: this.repeatTiming,
  });

  // --- Input events ---------------------------------------------------------

  protected onInput(text: string): void {
    this.draft.set(text);
    // The flag describes a *committed* failure; editing clears it.
    this.draftInvalid.set(false);
  }

  protected onFocus(): void {
    this.focused.set(true);
    if (this.selectOnFocus()) {
      queueMicrotask(() => this.inputRef().nativeElement.select());
    }
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.touched.set(true);
    if (this.commitOnBlur()) this.commitDraft();
    this.increment.cancel();
    this.decrement.cancel();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.readOnly()) return;

    const magnitude = event.shiftKey ? 'large' : event.altKey ? 'small' : 'normal';

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.applyStep(1, magnitude);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.applyStep(-1, magnitude);
        break;
      case 'PageUp':
        event.preventDefault();
        this.applyStep(1, 'large');
        break;
      case 'PageDown':
        event.preventDefault();
        this.applyStep(-1, 'large');
        break;
      case 'Home': {
        // No-op when unbounded: nothing sensible lives at an open fence.
        const min = this.min();
        if (min == null) return;
        event.preventDefault();
        this.draft.set(null);
        this.write(toDecimal(min));
        this.announceValue();
        break;
      }
      case 'End': {
        const max = this.max();
        if (max == null) return;
        event.preventDefault();
        this.draft.set(null);
        this.write(toDecimal(max));
        this.announceValue();
        break;
      }
      case 'Enter':
        // Never submit the form while an uncommitted draft is in the field.
        if (this.draft() != null) event.preventDefault();
        this.commitDraft();
        break;
      case 'Escape':
        event.preventDefault();
        this.draft.set(null);
        this.draftInvalid.set(false);
        this.increment.cancel();
        this.decrement.cancel();
        break;
      case 'Tab':
        // Never trap: commit what is typed, then let focus move on.
        this.commitDraft();
        break;
    }
  }

  /**
   * Scroll-to-step, off by default. A *focused* `<input type="number">` changes
   * value on the wheel, which silently corrupts forms people are merely
   * scrolling past. When enabled this needs focus **and** hover, and it only
   * calls `preventDefault` when the value actually moved, so a page does not
   * get scroll-trapped on a field sitting at its max.
   */
  protected onWheel(event: WheelEvent): void {
    if (!this.wheel() || !this.focused() || this.disabled() || this.readOnly()) return;
    const before = this.canonical();
    this.applyStep(event.deltaY < 0 ? 1 : -1);
    if (this.canonical() !== before) event.preventDefault();
  }

  // --- Styling --------------------------------------------------------------

  protected readonly className = computed(() => css({ display: 'block' }));

  protected readonly fieldRowClass = computed(() => {
    const options = this.componentOptions();
    return css([
      {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        // Full field height, so a stretched stepper column is the height of the
        // field rather than of the text inside it.
        height: '100%',
      },
      this.theme.gap(options.affixGap ?? 'xs'),
      // Trailing inset, matching the leading one, so a suffix — or the text
      // itself — does not sit against the border. It rides the row because
      // `removeInputPlatformStyling` zeroes padding on `& input` at a higher
      // specificity than this class. Skipped when a stepper holds the trailing
      // edge: a button is meant to reach the border.
      this.showSteppers() ? undefined : this.theme.paddingRight(this.trailingInset()),
    ]);
  });

  /** The shared field inset, reused on the trailing side so the two match. */
  private readonly trailingInset = computed(() => this.fieldChrome().paddingLeft);

  protected readonly inputClass = computed(() => {
    const options = this.componentOptions();
    return css({
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 'none',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      padding: 0,
      textAlign: this.align() ?? options.align ?? 'start',
      ...(options.tabularNumerals === false ? {} : { fontVariantNumeric: 'tabular-nums' }),
      // Colour alone cannot carry "this is not a number" (WCAG 1.4.1), and the
      // same underline already means the same thing on an invalid uni-tag.
      ...(this.draftInvalid()
        ? {
            textDecoration: 'underline dashed',
            textUnderlineOffset: 3,
            textDecorationColor: this.theme.colors()['warn'],
          }
        : {}),
    });
  });

  /**
   * The shared field chrome, read from the `input` theme entry — the same entry
   * `uni-input-box` resolves. Not a duplicate token: the inset has to be the
   * one every other field uses, or a money field stops lining up with the text
   * field above it.
   */
  private readonly fieldChrome = this.theme.getComponentOptions<UniInputBoxOptions>('input');

  /**
   * The leading inset for a prefix adornment. When there is a prefix the field
   * tells the box to stop insetting the `<input>` (`managedInset`) and puts the
   * inset here instead, so the `$` sits at the field's leading edge with the
   * number right after it. With no prefix the box keeps doing it — the text is
   * the leading edge then, and the box's rule outranks this class anyway.
   * `embedded` fields have no chrome, so they get no inset either.
   */
  private readonly leadingInset = computed(() =>
    this.embedded() ? undefined : this.theme.paddingLeft(this.fieldChrome().paddingLeft)
  );

  private affixBase() {
    const options = this.componentOptions();
    return {
      flex: 'none' as const,
      userSelect: 'none' as const,
      ...this.theme.color(options.affixColor ?? 'on-primary-surface-variant'),
    };
  }

  /** Carries the field's leading inset, being the first thing in the row. */
  protected readonly prefixClass = computed(() =>
    css([this.affixBase(), this.leadingInset()])
  );

  protected readonly suffixClass = computed(() => css([this.affixBase()]));

  /** Shared chrome for every stepper button, in any layout. */
  private stepperButton(): Record<string, unknown> {
    const options = this.componentOptions();
    const target = options.minTouchTarget ?? 24;
    return {
      display: 'grid',
      placeItems: 'center',
      flex: 'none',
      minWidth: target,
      minHeight: target,
      padding: 0,
      border: 0,
      background: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      touchAction: 'none',
      '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
      ...this.theme.focusRing(),
    };
  }

  /** Split and trailing layouts: one square button per direction. */
  protected readonly stepperClass = computed(() =>
    css({
      ...this.stepperButton(),
      width: this.componentOptions().stepperWidth ?? 32,
      alignSelf: 'stretch',
    })
  );

  /** Stacked layout: two half-height arrows sharing one column. */
  protected readonly stackedColumnClass = computed(() =>
    css({
      display: 'flex',
      flexDirection: 'column',
      flex: 'none',
      alignSelf: 'stretch',
      justifyContent: 'center',
      width: this.componentOptions().stepperWidth ?? 32,
    })
  );

  protected readonly stackedButtonClass = computed(() =>
    css({
      ...this.stepperButton(),
      width: '100%',
      // The two arrows split the field height between them. They cannot each
      // reach `minTouchTarget` — 2 × 24 does not fit a 32px field — which is
      // why a coarse pointer gets the `split` layout instead; see `layout`.
      minHeight: 0,
      flex: 1,
    })
  );

  protected readonly glyphSize = computed(() => (this.layout() === 'stacked' ? 12 : 18));
}
