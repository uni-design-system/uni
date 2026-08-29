import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { Size } from '@uni-design-system/uni-core';

import {
  clampDecimal,
  createAnnouncer,
  createPressRepeat,
  decimalScale,
  formatNumber,
  parseNumber,
  resolveNumberFormat,
  settleNumber,
  stepDecimal,
  toDecimal,
  uniqueId,
  visuallyHidden,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniIconComponent } from '../icon/icon.component';
import type { UniQuantityStepperOptions } from './quantity-stepper.model';

/**
 * `− 3 +` for cart lines, table cells and seat counts: the numeric core with no
 * field chrome, no label and no room for either.
 *
 * A separate component rather than a `chrome="bare"` flag on
 * `uni-number-input`, because this control is defined by what it does *not*
 * have — presets, affixes, expressions, four stepper layouts — and eight inputs
 * are easier to write correctly than forty with a list of which ones to leave
 * alone. The arithmetic, parsing and hold-to-repeat are the cdk's, shared with
 * the field, so `1,200` and the keyboard map behave identically in both.
 *
 * The middle stays a real input by default: typing `12` beats tapping `+`
 * eleven times. `editable=false` is for read-mostly tables.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-quantity-stepper, QuantityStepper',
  imports: [UniIconComponent],
  templateUrl: './quantity-stepper.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'quantityStepper' }],
  host: { '[class]': 'className()' },
})
export class UniQuantityStepperComponent
  extends BaseComponent<UniQuantityStepperOptions>
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

  // --- Configuration -------------------------------------------------------
  /**
   * Accessible name. Never visible and always needed — a cart with six of these
   * needs "Quantity, Blue T-shirt (M)", not six controls called "Quantity".
   */
  label = input.required<string>();
  // `min`/`max` are part of the FormValueControl contract — Signal Forms syncs
  // them from min()/max() validators — so their type must admit undefined.
  // Read `resolvedMin()` internally, never `min()`.
  min = input<number | undefined>(0);
  max = input<number>();
  step = input(1);
  override size = input<Size>('md');
  /** `false` renders the number as text: read-mostly tables. */
  editable = input(true);
  /**
   * The cart pattern in one attribute: at `min` the decrement button becomes a
   * remove affordance and emits `removed` rather than stepping. Without it
   * every shop reimplements the same `value === 1 ? remove() : step(-1)` branch
   * outside the component.
   */
  deleteAtMin = input(false);

  // --- Events --------------------------------------------------------------
  /**
   * The remove affordance was activated — the row should come out.
   *
   * Named `removed`, not the spec's `emptied`: that word is a native
   * `HTMLMediaElement` event, which `@angular-eslint/no-output-native` bans for
   * good reason, and `removed` is already what `uni-tag` calls this same
   * request.
   */
  removed = output<void>();

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('field');

  protected readonly srOnly = css(visuallyHidden);
  protected readonly announcer = createAnnouncer();
  protected readonly hintId = uniqueId('uni-quantity-stepper');

  /** Uncommitted text. `null` means "show the committed value". */
  private readonly draft = signal<string | null>(null);

  private readonly canonical = computed(() => {
    const value = this.value();
    return value == null ? null : toDecimal(value);
  });

  /** Quantities are plain numbers; precision follows the step. */
  protected readonly format = computed(() =>
    resolveNumberFormat({ decimals: [0, decimalScale(toDecimal(this.step()))] })
  );

  protected readonly displayText = computed(() => {
    const draft = this.draft();
    if (draft != null) return draft;
    const canonical = this.canonical();
    return canonical == null ? '' : formatNumber(canonical, this.format());
  });

  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly describedBy = computed(() =>
    [this.ariaDescribedBy(), this.hintId].filter(Boolean).join(' ')
  );

  // --- Fences ---------------------------------------------------------------

  /** A quantity has a floor even when a validator has not supplied one. */
  protected readonly resolvedMin = computed(() => this.min() ?? 0);

  protected readonly atMin = computed(() => {
    const canonical = this.canonical();
    return canonical != null && Number(canonical) <= this.resolvedMin();
  });

  protected readonly atMax = computed(() => {
    const max = this.max();
    const canonical = this.canonical();
    return max != null && canonical != null && Number(canonical) >= max;
  });

  /** At the floor with `deleteAtMin`, the − is a remove control instead. */
  protected readonly showDelete = computed(() => this.deleteAtMin() && this.atMin());

  protected readonly decrementIcon = computed(() => {
    const options = this.componentOptions();
    return this.showDelete()
      ? (options.deleteIcon ?? 'delete')
      : (options.decrementIcon ?? 'minus');
  });

  protected readonly decrementLabel = computed(() =>
    this.showDelete() ? `Remove ${this.label()}` : `Decrease ${this.label()}`
  );

  // --- Committing -----------------------------------------------------------

  protected onInput(text: string): void {
    this.draft.set(text);
  }

  /**
   * The same parse path as the field, so `1,200` commits as 1200 here too.
   * Unreadable text reverts rather than being kept: this control has no room to
   * show an error, and no `rejected` output to report one through.
   */
  protected commitDraft(): void {
    const draft = this.draft();
    if (draft == null) return;

    const result = parseNumber(draft, this.format());
    if (result.status !== 'ok') {
      this.draft.set(null);
      if (result.status === 'empty') return;
      this.announcer.announce(`${draft} is not a number.`);
      return;
    }

    const settled = settleNumber(result.value, this.format());
    const clamped = clampDecimal(settled, this.resolvedMin(), this.max());
    this.draft.set(null);
    this.value.set(Number(clamped.value));

    if (clamped.hit) {
      const bound = clamped.hit === 'min' ? this.resolvedMin() : this.max();
      this.announcer.announce(`${clamped.hit === 'min' ? 'Minimum' : 'Maximum'} is ${bound}.`);
    }
  }

  // --- Stepping -------------------------------------------------------------

  protected applyStep(direction: 1 | -1, announce = true): void {
    if (this.disabled()) return;

    if (this.draft() != null) this.commitDraft();

    const current = this.canonical();
    if (current == null) {
      const seed = toDecimal(this.resolvedMin());
      this.value.set(Number(seed));
      if (announce) this.announceValue();
      return;
    }

    const next = stepDecimal(current, direction, {
      step: this.step(),
      min: this.resolvedMin(),
      max: this.max(),
      stepOrigin: 'min',
    });

    if (next === current) {
      if (announce) this.announceFence(direction);
      return;
    }

    this.value.set(Number(next));
    if (announce) this.announceValue();
  }

  /**
   * The decrement button has two jobs. Below the floor with `deleteAtMin` it is
   * a remove control — a single click, with nothing to hold and repeat — so the
   * press/repeat machinery is skipped entirely in that state.
   */
  protected onDecrementPress(event: PointerEvent): void {
    if (this.showDelete()) return;
    this.decrement.press(event);
  }

  protected onDecrementClick(): void {
    if (this.disabled() || !this.showDelete()) return;
    this.removed.emit();
    this.announcer.announce(`${this.label()} removed.`);
  }

  private announceValue(): void {
    this.announcer.announce(`${this.displayText()}.`);
  }

  private announceFence(direction: 1 | -1): void {
    const bound = direction > 0 ? this.max() : this.resolvedMin();
    if (bound == null) return;
    this.announcer.announce(`${direction > 0 ? 'Maximum' : 'Minimum'}, ${bound}.`);
  }

  // --- Hold to repeat -------------------------------------------------------

  /** Announced on release only; narrating every intermediate value is noise. */
  protected readonly increment = createPressRepeat({
    onStep: () => this.applyStep(1, false),
    onRelease: () => this.announceValue(),
    disabled: () => this.disabled() || this.atMax(),
  });

  protected readonly decrement = createPressRepeat({
    onStep: () => this.applyStep(-1, false),
    onRelease: () => this.announceValue(),
    disabled: () => this.disabled() || this.atMin(),
  });

  // --- Keyboard -------------------------------------------------------------

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.applyStep(1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.applyStep(-1);
        break;
      case 'Enter':
        if (this.draft() != null) event.preventDefault();
        this.commitDraft();
        break;
      case 'Escape':
        event.preventDefault();
        this.draft.set(null);
        break;
      case 'Tab':
        this.commitDraft();
        break;
    }
  }

  protected onBlur(): void {
    this.touched.set(true);
    this.commitDraft();
    this.increment.cancel();
    this.decrement.cancel();
  }

  protected focusField(): void {
    this.inputRef()?.nativeElement.focus();
  }

  // --- Styling --------------------------------------------------------------

  protected readonly className = computed(() => css({ display: 'inline-block' }));

  /** Overall height, from the theme's `sizes` block. */
  private readonly height = computed(() => Number(this.style()['height'] ?? 32));

  protected readonly rootClass = computed(() => {
    const options = this.componentOptions();
    const colors = this.theme.colors();
    return css({
      display: 'inline-flex',
      alignItems: 'stretch',
      height: this.height(),
      // The themed size is the *outer* height, so a md stepper is 32px like the
      // field beside it rather than 32 plus its border.
      boxSizing: 'border-box',
      overflow: 'hidden',
      ...this.theme.backgroundColor(
        this.disabled() ? 'disabled-surface' : (options.color ?? 'primary-surface')
      ),
      ...this.theme.border(options.border ?? 'light'),
      ...this.theme.radius(options.borderRadius ?? 'xs'),
      ...(this.showError() ? { borderColor: colors['warn'] } : {}),
      ...(this.disabled() ? { cursor: 'not-allowed' } : {}),
    });
  });

  /** Square at the field height, so the pointer target is legal at every size. */
  protected readonly buttonClass = computed(() => {
    const colors = this.theme.colors();
    return css({
      display: 'grid',
      placeItems: 'center',
      flex: 'none',
      width: this.height(),
      padding: 0,
      border: 0,
      background: 'transparent',
      color: this.disabled() ? colors['on-disabled-surface'] : 'inherit',
      cursor: this.disabled() ? 'not-allowed' : 'pointer',
      touchAction: 'none',
      '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
      ...this.theme.focusRing(),
    });
  });

  private valueBase() {
    const options = this.componentOptions();
    const colors = this.theme.colors();
    return {
      flex: '1 1 auto',
      minWidth: options.valueWidth ?? '3ch',
      textAlign: 'center' as const,
      alignSelf: 'stretch' as const,
      border: 0,
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      padding: 0,
      outline: 'none',
      ...(options.tabularNumerals === false ? {} : { fontVariantNumeric: 'tabular-nums' as const }),
      // A rule either side, which is what makes the three parts read as one
      // control rather than three loose ones.
      borderInline: `1px solid ${colors[options.dividerColor ?? 'outline']}`,
    };
  }

  protected readonly inputClass = computed(() => css([this.valueBase()]));

  /** Read-only presentation: centred text on the same grid as the input. */
  protected readonly readoutClass = computed(() =>
    css([this.valueBase(), { display: 'grid', placeItems: 'center' }])
  );

  protected readonly glyphSize = computed(() => Math.max(12, Math.round(this.height() / 2)));
}
