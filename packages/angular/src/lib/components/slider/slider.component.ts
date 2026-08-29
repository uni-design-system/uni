import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  model,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { Variant } from '@uni-design-system/uni-core';

import {
  createAnnouncer,
  decimalScale,
  formatNumber,
  fromScaled,
  motionSafe,
  resolveNumberFormat,
  stepDecimal,
  toDecimal,
  toScaled,
  uniqueId,
  visuallyHidden,
  type UniNumberRange,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniSliderMark, UniSliderOptions } from './slider.model';

/** Index into the thumb pair. `0` is the `start` thumb, `1` the `end` thumb. */
type ThumbIndex = 0 | 1;

/**
 * Bounded numeric input by pointer, for values where the *position* is the
 * information: volume, opacity, weightings, price filters.
 *
 * Custom thumbs rather than `<input type="range">`, which the previous version
 * used: one native range input cannot carry two thumbs, marks or a tooltip, and
 * a second component for the range case would mean two keyboard maps to keep in
 * step. The step model and the keyboard map are the cdk's, shared with the
 * numeric fields, so nothing new is learned moving between them.
 *
 * All arithmetic on values runs through the cdk's exact decimal helpers —
 * stepping `0.1` never yields `0.30000000000000004`. Only pointer *positions*
 * use floats, and they are snapped to the grid before becoming a value.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-slider, Slider',
  templateUrl: './slider.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'slider' }],
  host: { '[class]': 'className()' },
})
export class UniSliderComponent
  extends BaseComponent<UniSliderOptions>
  implements FormValueControl<number | UniNumberRange | null>
{
  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  /** Shape follows `mode`: a number when `single`, a `UniNumberRange` when `range`. */
  readonly value = model<number | UniNumberRange | null>(null);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  // --- Configuration -------------------------------------------------------
  /** Accessible name, e.g. "Opacity". Names the group in range mode. */
  label = input.required<string>();
  mode = input<'single' | 'range'>('single');
  // `min`/`max` are part of the FormValueControl contract — Signal Forms syncs
  // them from min()/max() validators — so their type must admit undefined.
  min = input<number | undefined>(0);
  max = input<number | undefined>(100);
  step = input(1);
  /** `PageUp`/`PageDown` and `Shift+Arrow`. Default: a tenth of the range. */
  largeStep = input<number>();
  /** Fill anchor. Defaults to `min`; set `0` for a slider that spans ±. */
  origin = input<number>();
  marks = input<UniSliderMark[]>([]);
  /** Marks become the only valid stops — t-shirt sizing, Likert scales. */
  snapToMarks = input(false);
  /**
   * Where the current value is shown. `tooltip` appears on hover, focus and
   * drag; `inline` sits at the trailing edge of the track.
   *
   * A fourth mode, `'input'` — a compact `uni-number-input` as the readout —
   * lands with that component; widening this union is not a breaking change.
   */
  valueDisplay = input<'none' | 'inline' | 'tooltip'>('none');
  /** Overrides how a value is rendered and spoken. */
  formatValue = input<(value: number) => string>();
  /** Enforced distance between the two ends, in range mode. */
  minGap = input<number>();
  override variant = input<Variant>('primary');

  // --- Events --------------------------------------------------------------
  /** Continuous, during a drag or a held key. Bind this for a live preview. */
  sliding = output<number | UniNumberRange>();
  /**
   * Committed — on pointer release and key-up. **A form should bind this**:
   * piping a 60 Hz stream into a model is how sliders get blamed for jank.
   */
  changed = output<number | UniNumberRange>();

  private readonly trackRef = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly thumbRefs = viewChildren<ElementRef<HTMLElement>>('thumb');

  protected readonly srOnly = css(visuallyHidden);
  /** Fences and swaps only — `aria-valuetext` already narrates movement. */
  protected readonly announcer = createAnnouncer();
  protected readonly groupId = uniqueId('uni-slider');

  /** True from pointerdown until release, to suppress the jump transition. */
  protected readonly dragging = signal(false);
  private draggingThumb: ThumbIndex | null = null;
  /** Set by keydown, consumed by keyup, so one commit follows a key run. */
  private keyed = false;

  protected readonly isRange = computed(() => this.mode() === 'range');
  protected readonly resolvedMin = computed(() => this.min() ?? 0);
  protected readonly resolvedMax = computed(() => this.max() ?? 100);

  private derivePair(value: number | UniNumberRange | null): [number, number] {
    const min = this.resolvedMin();
    const max = this.resolvedMax();

    if (this.isRange()) {
      const range = (value ?? {}) as UniNumberRange;
      return [range.start ?? min, range.end ?? max];
    }
    return [typeof value === 'number' ? value : min, max];
  }

  /**
   * The two thumb positions, by **identity** rather than by order: thumb 0 is
   * whichever thumb the user grabbed first, not necessarily the lower one.
   *
   * A `linkedSignal` so an external write to `value` resets them, while a drag
   * moves them without writing the model on every frame. The computation
   * deliberately keeps the existing order when the incoming value describes the
   * same two positions — a commit writes the range back *sorted*, and
   * re-deriving from that would un-cross a crossed pair and yank the dragged
   * thumb out from under the pointer mid-drag.
   */
  private readonly thumbs = linkedSignal<number | UniNumberRange | null, [number, number]>({
    source: () => this.value(),
    computation: (value, previous) => {
      const next = this.derivePair(value);
      const prior = previous?.value;
      if (
        prior &&
        Math.min(prior[0], prior[1]) === Math.min(next[0], next[1]) &&
        Math.max(prior[0], prior[1]) === Math.max(next[0], next[1])
      ) {
        return prior;
      }
      return next;
    },
  });

  protected readonly thumbIndexes = computed<ThumbIndex[]>(() => (this.isRange() ? [0, 1] : [0]));

  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  /** Default large step: a tenth of the range, snapped to the step grid. */
  private readonly resolvedLargeStep = computed(() => {
    const explicit = this.largeStep();
    if (explicit != null) return explicit;
    const step = this.step();
    const tenth = (this.resolvedMax() - this.resolvedMin()) / 10;
    const snapped = Math.round(tenth / step) * step;
    return snapped > 0 ? snapped : step;
  });

  private readonly numberFormat = computed(() =>
    resolveNumberFormat({ decimals: [0, Math.max(decimalScale(toDecimal(this.step())), 0)] })
  );

  protected formatted(value: number): string {
    const custom = this.formatValue();
    if (custom) return custom(value);
    return formatNumber(toDecimal(value), this.numberFormat());
  }

  /** A mark's label speaks for its value, so a marks-only slider says "Medium". */
  private markLabel(value: number): string | undefined {
    return this.marks().find((mark) => mark.value === value && mark.label)?.label;
  }

  protected valueText(value: number): string {
    return this.markLabel(value) ?? this.formatted(value);
  }

  // --- Geometry -------------------------------------------------------------

  protected percentOf(value: number): number {
    const min = this.resolvedMin();
    const span = this.resolvedMax() - min;
    if (span <= 0) return 0;
    return Math.min(100, Math.max(0, ((value - min) / span) * 100));
  }

  protected readonly lowValue = computed(() => {
    const [a, b] = this.thumbs();
    return this.isRange() ? Math.min(a, b) : a;
  });

  protected readonly highValue = computed(() => {
    const [a, b] = this.thumbs();
    return this.isRange() ? Math.max(a, b) : a;
  });

  /** The fill spans between the ends in range mode, or origin → value. */
  protected readonly fillStart = computed(() => {
    if (this.isRange()) return this.percentOf(this.lowValue());
    const origin = this.origin() ?? this.resolvedMin();
    return this.percentOf(Math.min(origin, this.thumbs()[0]));
  });

  protected readonly fillEnd = computed(() => {
    if (this.isRange()) return 100 - this.percentOf(this.highValue());
    const origin = this.origin() ?? this.resolvedMin();
    return 100 - this.percentOf(Math.max(origin, this.thumbs()[0]));
  });

  protected readonly hasMarkLabels = computed(() => this.marks().some((mark) => !!mark.label));

  // --- ARIA per thumb -------------------------------------------------------

  protected thumbValue(index: ThumbIndex): number {
    return this.thumbs()[index];
  }

  /**
   * Each thumb's bound is the *other thumb's* position, so a screen-reader user
   * is told where the wall actually is rather than where the track ends.
   */
  protected thumbMin(index: ThumbIndex): number {
    if (!this.isRange()) return this.resolvedMin();
    return this.isLower(index) ? this.resolvedMin() : this.lowValue();
  }

  protected thumbMax(index: ThumbIndex): number {
    if (!this.isRange()) return this.resolvedMax();
    return this.isLower(index) ? this.highValue() : this.resolvedMax();
  }

  /** Thumbs may cross; which one is "minimum" follows position, not identity. */
  private isLower(index: ThumbIndex): boolean {
    const [a, b] = this.thumbs();
    return index === 0 ? a <= b : b < a;
  }

  protected thumbLabel(index: ThumbIndex): string {
    if (!this.isRange()) return this.label();
    return `${this.label()}, ${this.isLower(index) ? 'minimum' : 'maximum'}`;
  }

  // --- Value plumbing -------------------------------------------------------

  private currentValue(): number | UniNumberRange {
    if (!this.isRange()) return this.thumbs()[0];
    return { start: this.lowValue(), end: this.highValue() };
  }

  /** Exact `min + n · step`, so a snapped position never carries float drift. */
  private snapToGrid(raw: number): number {
    const marks = this.marks();
    if (this.snapToMarks() && marks.length) {
      return marks.reduce(
        (best, mark) => (Math.abs(mark.value - raw) < Math.abs(best - raw) ? mark.value : best),
        marks[0].value
      );
    }

    const min = toDecimal(this.resolvedMin());
    const step = toDecimal(this.step());
    if (Number(step) === 0) return this.resolvedMin();

    const steps = Math.round((raw - Number(min)) / Number(step));
    const scale = Math.max(decimalScale(min), decimalScale(step));
    const exact = fromScaled(
      toScaled(min, scale) + BigInt(steps) * toScaled(step, scale),
      scale
    );
    return this.clamp(Number(exact));
  }

  private clamp(value: number): number {
    return Math.min(this.resolvedMax(), Math.max(this.resolvedMin(), value));
  }

  /**
   * Move a thumb. `commit` writes the model and emits `changed`; without it the
   * move is visual and only emits `sliding`.
   */
  private setThumb(index: ThumbIndex, next: number, commit: boolean): void {
    let target = this.clamp(next);

    // With a minimum gap the ends fence each other instead of swapping — the
    // gap is the whole point of setting it.
    const gap = this.minGap();
    if (gap != null && this.isRange()) {
      const [a, b] = this.thumbs();
      const other = index === 0 ? b : a;
      const current = index === 0 ? a : b;
      if (current <= other) target = Math.min(target, other - gap);
      else target = Math.max(target, other + gap);
      target = this.clamp(target);
    }

    const previous = this.thumbs()[index];
    if (previous !== target) {
      this.thumbs.update((pair) => {
        const next: [number, number] = [...pair] as [number, number];
        next[index] = target;
        return next;
      });
      this.sliding.emit(this.currentValue());
    }

    if (commit) this.commit();
  }

  private commit(): void {
    this.value.set(this.currentValue());
    this.changed.emit(this.currentValue());
  }

  private announceValue(index: ThumbIndex): void {
    this.announcer.announce(`${this.valueText(this.thumbs()[index])}.`);
  }

  // --- Pointer --------------------------------------------------------------

  /** True when the track is laid out right-to-left. */
  private isRtl(): boolean {
    const track = this.trackRef().nativeElement;
    return getComputedStyle(track).direction === 'rtl';
  }

  /** Pointer x → a raw value. The track's visual direction flips in RTL; the value's does not. */
  private valueFromPointer(event: PointerEvent): number {
    const rect = this.trackRef().nativeElement.getBoundingClientRect();
    if (rect.width <= 0) return this.resolvedMin();
    let ratio = (event.clientX - rect.left) / rect.width;
    if (this.isRtl()) ratio = 1 - ratio;
    const min = this.resolvedMin();
    return min + Math.min(1, Math.max(0, ratio)) * (this.resolvedMax() - min);
  }

  private nearestThumb(raw: number): ThumbIndex {
    if (!this.isRange()) return 0;
    const [a, b] = this.thumbs();
    return Math.abs(a - raw) <= Math.abs(b - raw) ? 0 : 1;
  }

  protected onTrackPointerDown(event: PointerEvent): void {
    if (this.disabled()) return;
    event.preventDefault();

    const raw = this.valueFromPointer(event);
    const onThumb = (event.target as Element | null)?.closest('[role="slider"]');
    const index: ThumbIndex = onThumb
      ? (Number((onThumb as HTMLElement).dataset['thumb']) as ThumbIndex)
      : this.nearestThumb(raw);

    this.draggingThumb = index;
    this.thumbRefs()[index]?.nativeElement.focus();

    // Pressing the track jumps the nearest thumb there — no "grab the thumb
    // first" tax — and that jump animates. A drag never does.
    if (!onThumb) this.setThumb(index, this.snapToGrid(raw), false);
    this.dragging.set(true);

    const track = this.trackRef().nativeElement;
    if (typeof track.setPointerCapture === 'function') {
      try {
        track.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic pointer id; the move/up listeners below still work.
      }
    }
  }

  protected onTrackPointerMove(event: PointerEvent): void {
    if (this.draggingThumb == null) return;
    this.setThumb(this.draggingThumb, this.snapToGrid(this.valueFromPointer(event)), false);
  }

  protected onTrackPointerUp(): void {
    const index = this.draggingThumb;
    this.dragging.set(false);
    if (index == null) return;
    this.draggingThumb = null;
    this.touched.set(true);
    this.commit();
    this.announceValue(index);
  }

  // --- Keyboard -------------------------------------------------------------

  /** Adjacent mark, when marks are the only stops. */
  private markStep(current: number, direction: 1 | -1): number {
    const values = this.marks()
      .map((mark) => mark.value)
      .sort((a, b) => a - b);
    if (!values.length) return current;
    const at = values.indexOf(current);
    if (at < 0) return this.snapToGrid(current);
    return values[Math.min(values.length - 1, Math.max(0, at + direction))];
  }

  private stepFrom(current: number, direction: 1 | -1, large: boolean): number {
    if (this.snapToMarks() && this.marks().length) return this.markStep(current, direction);
    const next = stepDecimal(toDecimal(current), direction, {
      step: large ? this.resolvedLargeStep() : this.step(),
      min: this.resolvedMin(),
      max: this.resolvedMax(),
      stepOrigin: 'min',
    });
    return Number(next);
  }

  protected onThumbKeydown(event: KeyboardEvent, index: ThumbIndex): void {
    if (this.disabled()) return;

    const current = this.thumbs()[index];
    const large = event.shiftKey;
    // Horizontal arrows follow the picture, so they mirror in RTL; the vertical
    // ones follow the number and never do (APG's rule).
    const toward = this.isRtl() ? -1 : 1;
    // Every branch either assigns or returns, so this needs no initializer.
    let next: number;

    switch (event.key) {
      case 'ArrowUp':
        next = this.stepFrom(current, 1, large);
        break;
      case 'ArrowDown':
        next = this.stepFrom(current, -1, large);
        break;
      case 'ArrowRight':
        next = this.stepFrom(current, toward > 0 ? 1 : -1, large);
        break;
      case 'ArrowLeft':
        next = this.stepFrom(current, toward > 0 ? -1 : 1, large);
        break;
      case 'PageUp':
        next = this.stepFrom(current, 1, true);
        break;
      case 'PageDown':
        next = this.stepFrom(current, -1, true);
        break;
      case 'Home':
        next = this.resolvedMin();
        break;
      case 'End':
        next = this.resolvedMax();
        break;
      default:
        return;
    }

    event.preventDefault();
    this.keyed = true;
    this.setThumb(index, next, false);
  }

  /** One commit and one announcement per key run, not per repeat. */
  protected onThumbKeyup(index: ThumbIndex): void {
    if (!this.keyed) return;
    this.keyed = false;
    this.touched.set(true);
    this.commit();
    this.announceValue(index);
  }

  protected onThumbBlur(): void {
    this.touched.set(true);
  }

  // --- Styling --------------------------------------------------------------

  protected readonly className = computed(() => css({ display: 'block' }));

  private readonly fillColor = computed(() => {
    const colors = this.theme.colors();
    return colors[this.variant()] ?? colors['primary'];
  });

  protected readonly rootClass = computed(() =>
    css({
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      ...(this.disabled() ? { cursor: 'not-allowed' } : {}),
    })
  );

  protected readonly rowClass = computed(() => {
    const options = this.componentOptions();
    return css({
      display: 'flex',
      alignItems: 'center',
      ...this.theme.gap(options.labelTypeface ? 'md' : 'md'),
    });
  });

  protected readonly trackClass = computed(() => {
    const options = this.componentOptions();
    const colors = this.theme.colors();
    const height = options.trackHeight ?? 4;
    const target = options.minTouchTarget ?? 24;
    const radius = this.theme.radii()[options.borderRadius ?? 'max'];

    return css({
      position: 'relative',
      flex: '1 1 auto',
      height,
      borderRadius: radius,
      backgroundColor: this.disabled()
        ? colors['disabled-container']
        : colors[options.trackColor ?? 'primary-container'],
      cursor: this.disabled() ? 'not-allowed' : 'pointer',
      // Vertical room for the hit areas, horizontal room so a thumb at either
      // fence is not clipped by the track's own box.
      marginBlock: Math.max(0, (target - height) / 2),
      marginInline: target / 2,
      // Only the track: a vertical page scroll starting here still scrolls.
      touchAction: 'none',
    });
  });

  protected readonly fillClass = computed(() => {
    const options = this.componentOptions();
    const colors = this.theme.colors();
    const duration = options.transitionMs ?? 120;

    return css({
      position: 'absolute',
      insetBlock: 0,
      borderRadius: this.theme.radii()[options.borderRadius ?? 'max'],
      backgroundColor: this.disabled() ? colors['disabled'] : this.fillColor(),
      ...(this.dragging()
        ? {}
        : motionSafe({
            transitionProperty: 'inset-inline-start, inset-inline-end',
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: 'ease',
          })),
    });
  });

  protected readonly markClass = computed(() => {
    const options = this.componentOptions();
    const colors = this.theme.colors();
    const size = options.markSize ?? 3;

    return css({
      position: 'absolute',
      top: '50%',
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: colors[options.markColor ?? 'on-primary-container'],
      transform: 'translate(-50%, -50%)',
      opacity: 0.7,
      pointerEvents: 'none',
    });
  });

  protected readonly thumbClass = computed(() => {
    const options = this.componentOptions();
    const colors = this.theme.colors();
    const size = options.thumbSize ?? 16;
    const target = options.minTouchTarget ?? 24;
    const duration = options.transitionMs ?? 120;

    return css({
      position: 'absolute',
      top: '50%',
      // The hit area is the element; the visual dot is the pseudo-element, so
      // a 16px thumb still presents a 24px target (WCAG 2.5.8).
      width: target,
      height: target,
      transform: 'translate(-50%, -50%)',
      display: 'grid',
      placeItems: 'center',
      borderRadius: '50%',
      cursor: this.disabled() ? 'not-allowed' : 'grab',
      touchAction: 'none',
      pointerEvents: this.disabled() ? 'none' : 'auto',
      '&:active': { cursor: 'grabbing' },
      '&::after': {
        content: '""',
        width: size,
        height: size,
        borderRadius: this.theme.radii()[options.thumbBorderRadius ?? 'max'],
        backgroundColor: this.disabled() ? colors['on-disabled'] : this.fillColor(),
        border: `2px solid ${colors['background']}`,
        boxSizing: 'border-box',
      },
      ...this.theme.focusRing(),
      ...(this.dragging()
        ? {}
        : motionSafe({
            transitionProperty: 'inset-inline-start',
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: 'ease',
          })),
    });
  });

  protected readonly tooltipClass = computed(() => {
    const options = this.componentOptions();
    const colors = this.theme.colors();

    return css({
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 4,
      padding: '2px 6px',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      opacity: 0,
      backgroundColor: colors[options.tooltipColor ?? 'inverse-surface'],
      borderRadius: this.theme.radii()[options.tooltipBorderRadius ?? 'xs'],
      ...this.theme.color(options.tooltipTextColor ?? 'on-inverse-surface'),
      ...this.theme.typeface(options.labelTypeface ?? 'label'),
      ...this.theme.boxShadow(options.tooltipShadow ?? 'menu'),
      // Shown on hover and focus, and throughout a drag.
      '[role="slider"]:hover > &, [role="slider"]:focus-visible > &': { opacity: 1 },
    });
  });

  protected readonly labelsClass = computed(() => {
    const options = this.componentOptions();
    const target = options.minTouchTarget ?? 24;
    return css({
      position: 'relative',
      height: 18,
      marginInline: target / 2,
    });
  });

  protected readonly labelClass = computed(() => {
    const options = this.componentOptions();
    return css({
      position: 'absolute',
      transform: 'translateX(-50%)',
      whiteSpace: 'nowrap',
      ...this.theme.color(options.labelColor ?? 'on-surface-variant'),
      ...this.theme.typeface(options.labelTypeface ?? 'label'),
    });
  });

  protected readonly readoutClass = computed(() => {
    const options = this.componentOptions();
    return css({
      flex: 'none',
      minWidth: '4ch',
      textAlign: 'end',
      fontVariantNumeric: 'tabular-nums',
      ...this.theme.color(options.labelColor ?? 'on-surface-variant'),
      ...this.theme.typeface(options.labelTypeface ?? 'label'),
    });
  });
}
