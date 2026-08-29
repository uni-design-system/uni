import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';

import {
  clampDecimal,
  compareDecimal,
  createAnnouncer,
  formatNumber,
  fromScaled,
  decimalScale,
  parseNumber,
  rawNumberText,
  resolveNumberFormat,
  settleNumber,
  speakNumber,
  stepDecimal,
  toDecimal,
  toScaled,
  uniqueId,
  visuallyHidden,
  type UniNumberPreset,
  type UniNumberRange,
  type UniRoundingMode,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import type { UniInputBoxOptions } from '../input-box/input-box.model';
import type {
  UniNumberRangeInputOptions,
  UniNumberRangePart,
  UniNumberRangeRejection,
} from './number-range-input.model';

/**
 * Two linked numeric fields in one chrome, with one `{ start, end }` value —
 * price filters, thresholds, tolerances.
 *
 * `start`/`end` deliberately match `UniDateRange`, so the library has one range
 * vocabulary, and they avoid colliding with the `min`/`max` **inputs**, which
 * mean the fence rather than the value.
 *
 * It owns its commit path rather than nesting two `uni-number-input`s, because
 * the two behaviours the spec asks for need *different* bounds: a stepper must
 * be fenced at the other end, while a typed commit must reach the parent
 * un-clamped so a backwards range can be swapped instead of destroyed. A child
 * field applies one bound pair to both. The arithmetic, parsing and formatting
 * are still the cdk's, shared with every other numeric control.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-number-range-input, NumberRangeInput',
  imports: [UniInputBoxComponent],
  templateUrl: './number-range-input.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'numberRangeInput' }],
  host: { '[class]': 'className()' },
})
export class UniNumberRangeInputComponent
  extends BaseComponent<UniNumberRangeInputOptions>
  implements FormValueControl<UniNumberRange | null>
{
  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  readonly value = model<UniNumberRange | null>(null);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  // --- Configuration -------------------------------------------------------
  /** Names the group, e.g. "Price range". */
  label = input.required<string>();
  startLabel = input('Minimum');
  endLabel = input('Maximum');

  // Forwarded to both parts, so the two ends always read alike.
  preset = input<UniNumberPreset>('decimal');
  currency = input<string>();
  locale = input<string>();
  prefix = input<string>();
  suffix = input<string>();
  decimals = input<number | [min: number, max: number]>();
  grouping = input<'auto' | 'always' | 'min2' | false>();
  roundingMode = input<UniRoundingMode>('half-up');
  placeholderStart = input<string>();
  placeholderEnd = input<string>();

  // `min`/`max` are part of the FormValueControl contract — Signal Forms syncs
  // them from min()/max() validators — so their type must admit undefined.
  min = input<number | undefined>();
  max = input<number | undefined>();
  step = input(1);
  /** Enforced distance between the two ends. */
  minGap = input<number>();

  // --- Events --------------------------------------------------------------
  /** The ends were entered backwards and have been exchanged. */
  swapped = output<UniNumberRange>();
  /** A typed commit on one end could not be read; its text stays in place. */
  rejected = output<UniNumberRangeRejection>();

  private readonly inputRefs = viewChildren<ElementRef<HTMLInputElement>>('field');

  protected readonly srOnly = css(visuallyHidden);
  protected readonly announcer = createAnnouncer();
  protected readonly hintId = uniqueId('uni-number-range-hint');
  protected readonly groupId = uniqueId('uni-number-range');

  /** Uncommitted text per part. `null` means "show the committed value". */
  private readonly drafts = signal<Record<UniNumberRangePart, string | null>>({
    start: null,
    end: null,
  });
  private readonly focusedPart = signal<UniNumberRangePart | null>(null);
  private readonly invalidPart = signal<UniNumberRangePart | null>(null);

  protected readonly parts: readonly UniNumberRangePart[] = ['start', 'end'];

  private readonly fieldChrome = this.theme.getComponentOptions<UniInputBoxOptions>('input');

  protected readonly format = computed(() =>
    resolveNumberFormat({
      preset: this.preset(),
      currency: this.currency(),
      locale: this.locale() ?? (document.documentElement.lang || navigator.language || 'en-US'),
      decimals: this.decimals(),
      grouping: this.grouping(),
      prefix: this.prefix(),
      suffix: this.suffix(),
      roundingMode: this.roundingMode(),
      min: this.min(),
    })
  );

  /** Form-level error, which belongs to both ends. */
  protected readonly formError = computed(
    () => this.invalid() && (this.touched() || this.dirty())
  );

  /**
   * Box-level error. A refused draft in *one* end flags the shared chrome, but
   * must not flag the other end's input — that end is fine.
   */
  protected readonly showError = computed(() => this.formError() || this.invalidPart() != null);

  protected readonly describedBy = computed(() =>
    [this.ariaDescribedBy(), this.hintId].filter(Boolean).join(' ')
  );

  // --- Per-part reads -------------------------------------------------------

  /** The committed canonical decimal for a part, or `null` when that end is open. */
  private canonicalOf(part: UniNumberRangePart): string | null {
    const range = this.value();
    const raw = part === 'start' ? range?.start : range?.end;
    return raw == null ? null : toDecimal(raw);
  }

  protected valueOf(part: UniNumberRangePart): number | null {
    const range = this.value();
    return (part === 'start' ? range?.start : range?.end) ?? null;
  }

  protected displayText(part: UniNumberRangePart): string {
    const draft = this.drafts()[part];
    if (draft != null) return draft;

    const canonical = this.canonicalOf(part);
    if (canonical == null) return '';
    return this.focusedPart() === part
      ? rawNumberText(canonical, this.format())
      : formatNumber(canonical, this.format());
  }

  protected partLabel(part: UniNumberRangePart): string {
    return `${this.label()}, ${part === 'start' ? this.startLabel() : this.endLabel()}`;
  }

  protected valueTextOf(part: UniNumberRangePart): string {
    return speakNumber(this.canonicalOf(part), this.format());
  }

  protected isInvalid(part: UniNumberRangePart): boolean {
    return this.invalidPart() === part;
  }

  // --- Fences ---------------------------------------------------------------

  /** Exact `a ± b` without a float, for the gap arithmetic. */
  private shiftBy(value: string, by: string, direction: 1 | -1): string {
    const scale = Math.max(decimalScale(value), decimalScale(by));
    const moved =
      toScaled(value, scale) + BigInt(direction) * toScaled(by, scale);
    return fromScaled(moved, scale);
  }

  /**
   * The fence a part's **stepping** and its ARIA see: the other end, held off
   * by `minGap`, intersected with the outer bounds. This is deliberately
   * tighter than what a typed commit is measured against — the steppers must
   * not walk one end through the other, while typing a backwards range should
   * be swapped rather than clamped away.
   */
  protected stepFence(part: UniNumberRangePart): { min?: number; max?: number } {
    const gap = toDecimal(this.minGap() ?? 0);
    const outerMin = this.min();
    const outerMax = this.max();

    if (part === 'start') {
      const other = this.canonicalOf('end');
      if (other == null) return { min: outerMin, max: outerMax };
      const cap = this.shiftBy(other, gap, -1);
      const capped =
        outerMax != null && compareDecimal(cap, toDecimal(outerMax)) > 0 ? outerMax : Number(cap);
      return { min: outerMin, max: capped };
    }

    const other = this.canonicalOf('start');
    if (other == null) return { min: outerMin, max: outerMax };
    const floor = this.shiftBy(other, gap, 1);
    const floored =
      outerMin != null && compareDecimal(floor, toDecimal(outerMin)) < 0 ? outerMin : Number(floor);
    return { min: floored, max: outerMax };
  }

  // --- Writing --------------------------------------------------------------

  private writeRange(start: string | null, end: string | null): void {
    if (start == null && end == null) {
      this.value.set(null);
      return;
    }
    this.value.set({
      ...(start == null ? {} : { start: Number(start) }),
      ...(end == null ? {} : { end: Number(end) }),
    });
  }

  protected onInput(part: UniNumberRangePart, text: string): void {
    this.drafts.update((drafts) => ({ ...drafts, [part]: text }));
    if (this.invalidPart() === part) this.invalidPart.set(null);
  }

  /**
   * Commit one part. Out-of-range clamps to the **outer** bounds only, so the
   * other end never destroys what was typed; the ends are then reconciled.
   */
  protected commitPart(part: UniNumberRangePart): void {
    const draft = this.drafts()[part];
    if (draft == null) return;

    const result = parseNumber(draft, this.format(), { currency: this.currency() });

    if (result.status === 'error') {
      this.invalidPart.set(part);
      this.rejected.emit({ part, raw: draft, reason: result.reason as 'unparseable' });
      this.announcer.announce(`${draft} is not a number.`);
      return;
    }

    this.drafts.update((drafts) => ({ ...drafts, [part]: null }));
    this.invalidPart.set(null);

    let start = this.canonicalOf('start');
    let end = this.canonicalOf('end');

    if (result.status === 'empty') {
      if (part === 'start') start = null;
      else end = null;
      this.writeRange(start, end);
      return;
    }

    const settled = clampDecimal(
      settleNumber(result.value, this.format()),
      this.min(),
      this.max()
    ).value;

    if (part === 'start') start = settled;
    else end = settled;

    this.reconcile(part, start, end);
  }

  /**
   * Put the two ends in order. A backwards pair is **swapped**, not refused —
   * the same rule `uni-calendar` applies to a backwards date range, because the
   * user pointed at the range they meant. Otherwise `minGap` is honoured by
   * pushing the end that was just edited back to the boundary, which is what
   * makes stepping behave as a fence rather than dragging the other end along.
   */
  private reconcile(
    edited: UniNumberRangePart,
    start: string | null,
    end: string | null
  ): void {
    if (start != null && end != null) {
      if (compareDecimal(start, end) > 0) {
        const swapped = { start: Number(end), end: Number(start) };
        this.value.set(swapped);
        this.swapped.emit(swapped);
        this.announcer.announce(
          `Range ${formatNumber(end, this.format())} to ${formatNumber(start, this.format())}. Ends swapped.`
        );
        return;
      }

      const gap = toDecimal(this.minGap() ?? 0);
      if (Number(gap) > 0) {
        const distance = this.shiftBy(end, start, -1);
        if (compareDecimal(distance, gap) < 0) {
          if (edited === 'end') end = this.shiftBy(start, gap, 1);
          else start = this.shiftBy(end, gap, -1);
          this.announcer.announce(
            `Kept ${formatNumber(gap, this.format())} between the ends.`
          );
        }
      }
    }

    this.writeRange(start, end);
  }

  // --- Stepping -------------------------------------------------------------

  protected applyStep(part: UniNumberRangePart, direction: 1 | -1, large = false): void {
    if (this.disabled()) return;
    if (this.drafts()[part] != null) this.commitPart(part);

    const fence = this.stepFence(part);
    const current = this.canonicalOf(part);

    if (current == null) {
      const seed = toDecimal(fence.min ?? this.min() ?? 0);
      this.reconcile(part, part === 'start' ? seed : this.canonicalOf('start'), part === 'end' ? seed : this.canonicalOf('end'));
      this.announceValue(part);
      return;
    }

    const next = stepDecimal(current, direction, {
      step: large ? this.step() * 10 : this.step(),
      min: fence.min,
      max: fence.max,
      stepOrigin: 'min',
    });

    if (next === current) {
      const bound = direction > 0 ? fence.max : fence.min;
      if (bound != null) {
        this.announcer.announce(`${direction > 0 ? 'Maximum' : 'Minimum'}, ${bound}.`);
      }
      return;
    }

    this.reconcile(
      part,
      part === 'start' ? next : this.canonicalOf('start'),
      part === 'end' ? next : this.canonicalOf('end')
    );
    this.announceValue(part);
  }

  private announceValue(part: UniNumberRangePart): void {
    this.announcer.announce(`${this.valueTextOf(part)}.`);
  }

  // --- Events ---------------------------------------------------------------

  protected onFocus(part: UniNumberRangePart): void {
    this.focusedPart.set(part);
  }

  protected onBlur(part: UniNumberRangePart): void {
    if (this.focusedPart() === part) this.focusedPart.set(null);
    this.touched.set(true);
    this.commitPart(part);
  }

  protected onKeydown(event: KeyboardEvent, part: UniNumberRangePart): void {
    const fence = this.stepFence(part);

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.applyStep(part, 1, event.shiftKey);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.applyStep(part, -1, event.shiftKey);
        break;
      case 'PageUp':
        event.preventDefault();
        this.applyStep(part, 1, true);
        break;
      case 'PageDown':
        event.preventDefault();
        this.applyStep(part, -1, true);
        break;
      case 'Home':
        if (fence.min == null) return;
        event.preventDefault();
        this.drafts.update((d) => ({ ...d, [part]: null }));
        this.reconcile(
          part,
          part === 'start' ? toDecimal(fence.min) : this.canonicalOf('start'),
          part === 'end' ? toDecimal(fence.min) : this.canonicalOf('end')
        );
        break;
      case 'End':
        if (fence.max == null) return;
        event.preventDefault();
        this.drafts.update((d) => ({ ...d, [part]: null }));
        this.reconcile(
          part,
          part === 'start' ? toDecimal(fence.max) : this.canonicalOf('start'),
          part === 'end' ? toDecimal(fence.max) : this.canonicalOf('end')
        );
        break;
      case 'Enter':
        if (this.drafts()[part] != null) event.preventDefault();
        this.commitPart(part);
        break;
      case 'Escape':
        event.preventDefault();
        this.drafts.update((d) => ({ ...d, [part]: null }));
        this.invalidPart.set(null);
        break;
      case 'Tab':
        this.commitPart(part);
        break;
    }
  }

  // --- Styling --------------------------------------------------------------

  protected readonly className = computed(() => css({ display: 'block' }));

  protected readonly rowClass = computed(() => {
    const options = this.componentOptions();
    return css([
      {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      },
      this.theme.gap(options.partGap ?? 'sm'),
      // The inset rides the row, not the first `<input>`: uni-input-box styles
      // `& input` at a higher specificity than this class can reach, so an
      // inset set on the input itself is silently overridden. See
      // `managedInset`, which is why the box is not applying it either.
      this.theme.paddingLeft(this.fieldChrome().paddingLeft),
    ]);
  });

  /** Each end is its own `[prefix][number][suffix]` group. */
  protected readonly partWrapClass = computed(() => {
    const options = this.componentOptions();
    return css([
      { display: 'flex', alignItems: 'center', flex: '1 1 0', minWidth: 0 },
      this.theme.gap(options.affixGap ?? 'xs'),
    ]);
  });

  protected readonly affixClass = computed(() => {
    const options = this.componentOptions();
    return css([
      { flex: 'none', userSelect: 'none' as const },
      this.theme.color(options.affixColor ?? 'on-primary-surface-variant'),
    ]);
  });

  protected readonly partClass = computed(() => css([this.partBase()]));

  private partBase() {
    return {
      flex: '1 1 0',
      minWidth: 0,
      border: 0,
      outline: 'none',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      padding: 0,
      fontVariantNumeric: 'tabular-nums' as const,
    };
  }

  protected readonly invalidClass = computed(() => {
    // Colour alone cannot carry "this is not a number" (WCAG 1.4.1).
    return css({
      textDecoration: 'underline dashed',
      textUnderlineOffset: 3,
      textDecorationColor: this.theme.colors()['warn'],
    });
  });

  protected readonly dividerClass = computed(() => {
    const options = this.componentOptions();
    return css({
      flex: 'none',
      userSelect: 'none',
      ...this.theme.color(options.dividerColor ?? 'outline'),
    });
  });

  protected readonly dividerText = computed(() => this.componentOptions().dividerText ?? '–');
}
