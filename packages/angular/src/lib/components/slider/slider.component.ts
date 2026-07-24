import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniSliderOptions } from './slider.model';

/**
 * Range slider on a native `<input type="range">` — keyboard interaction and
 * the ARIA slider contract come from the platform. Fill, track, thumb and
 * radii resolve from `slider` theme tokens; the fill percentage rides a CSS
 * custom property so dragging never regenerates styles.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-slider, Slider',
  providers: [{ provide: COMPONENT_NAME, useValue: 'slider' }],
  template: `
    <input
      type="range"
      [class]="inputClass()"
      [style.--uni-slider-fill]="fillPercent()"
      [min]="resolvedMin()"
      [max]="resolvedMax()"
      [step]="step()"
      [value]="value()"
      [disabled]="disabled()"
      (input)="handleInput($event)"
      (blur)="markAsTouched()"
      [attr.aria-label]="label()"
      [attr.aria-describedby]="ariaDescribedBy() || null"
    />
  `,
})
export class UniSliderComponent
  extends BaseComponent<UniSliderOptions>
  implements FormValueControl<number>
{
  // --- REQUIRED SIGNALS (populated by FormValueControl) ---
  readonly value = model<number>(0);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);

  /** Synced from required() validators by the Signal Forms [field] directive. */
  readonly required = input(false);

  /**
   * Id(s) of external element(s) describing this control — typically your
   * app-rendered value or error text — exposed as aria-describedby.
   */
  readonly ariaDescribedBy = input<string>();

  // --- CONFIGURATION ---
  label = input.required<string>();
  // `min`/`max` are part of the FormValueControl contract (synced from
  // min()/max() validators), so their type must admit undefined.
  min = input<number | undefined>(0);
  max = input<number | undefined>(100);
  step = input(1);

  protected readonly resolvedMin = computed(() => this.min() ?? 0);
  protected readonly resolvedMax = computed(() => this.max() ?? 100);

  markAsTouched() {
    this.touched.set(true);
  }

  handleInput(event: Event) {
    this.value.set(Number((event.target as HTMLInputElement).value));
  }

  protected readonly fillPercent = computed(() => {
    const min = this.resolvedMin();
    const range = this.resolvedMax() - min;
    if (range <= 0) return '0%';
    const ratio = (this.value() - min) / range;
    return `${Math.min(100, Math.max(0, ratio * 100))}%`;
  });

  protected readonly inputClass = computed(() => {
    const options = this.componentOptions();
    const fill = this.theme.colors()[options.color ?? 'primary'];
    const track = this.theme.colors()[options.trackColor ?? 'surface-variant'];
    const radius = this.theme.radii()[options.borderRadius ?? 'max'];
    const trackHeight = options.trackHeight ?? 4;
    const thumbSize = options.thumbSize ?? 16;
    // Webkit paints the fill via a gradient stopped at the custom property;
    // Firefox has a real ::-moz-range-progress.
    const trackFill = `linear-gradient(to right, ${fill} var(--uni-slider-fill), ${track} var(--uni-slider-fill))`;
    const thumb = {
      appearance: 'none' as const,
      width: thumbSize,
      height: thumbSize,
      borderRadius: radius,
      border: 'none',
      background: fill,
      cursor: 'pointer',
    };
    return css({
      appearance: 'none',
      width: '100%',
      height: thumbSize,
      margin: 0,
      background: 'transparent',
      cursor: 'pointer',
      '&::-webkit-slider-runnable-track': {
        height: trackHeight,
        borderRadius: radius,
        background: trackFill,
      },
      '&::-webkit-slider-thumb': {
        ...thumb,
        marginTop: (trackHeight - thumbSize) / 2,
      },
      '&::-moz-range-track': { height: trackHeight, borderRadius: radius, background: track },
      '&::-moz-range-progress': { height: trackHeight, borderRadius: radius, background: fill },
      '&::-moz-range-thumb': thumb,
      '&:focus-visible': { outline: `2px solid ${fill}`, outlineOffset: 2 },
      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.5,
        '&::-webkit-slider-thumb': { cursor: 'not-allowed' },
        '&::-moz-range-thumb': { cursor: 'not-allowed' },
      },
    });
  });
}
