import type {
  ColorKey,
  ContainerColorToken,
  Motion,
  Radius,
  Shadow,
  Typeface,
} from '@uni-design-system/uni-core';

/** A labelled stop on the track. `label` folds into `aria-valuetext` at that value. */
export interface UniSliderMark {
  value: number;
  /** Shown under the track and spoken instead of the number, e.g. `'Medium'`. */
  label?: string;
}

/** Which thumb a range slider is reporting on. */
export type UniSliderThumb = 'start' | 'end';

/**
 * Theme-level options for `uni-slider`.
 *
 * Fill color is deliberately **not** here — it is the `variant` role, the
 * same rule every other component follows, so `variant="warn"` recolors a
 * slider without a theme edit. The track is a groove rather than an accent, so
 * it stays a token. The thumb follows the variant by default (`'fill'`), but a
 * theme may restyle it — a white dot ringed in the variant, say.
 */
export interface UniSliderOptions {
  /** Track thickness in px. */
  trackHeight?: number;
  /** Unfilled track color. Any color token — a hairline like `outline` suits a groove. */
  trackColor?: ColorKey;
  /** Track radius token. */
  borderRadius?: Radius;
  /** Visual thumb diameter in px. The hit area is padded to `minTouchTarget`. */
  thumbSize?: number;
  /** Thumb radius token. */
  thumbBorderRadius?: Radius;
  /** Thumb dot color. `'fill'` (the default) is the variant's color. */
  thumbColor?: ColorKey | 'fill';
  /** Thumb ring color. `'fill'` is the variant's color. Defaults to `background`. */
  thumbBorderColor?: ColorKey | 'fill';
  /** Thumb ring width in px. Defaults to `2`. */
  thumbBorderWidth?: number;
  /** Shadow token lifting the thumb dot. None by default. */
  thumbShadow?: Shadow;
  /**
   * Minimum pointer target for a thumb, in px — WCAG 2.2 SC 2.5.8 floor. The
   * visual dot stays `thumbSize`; the transparent hit area grows to this.
   */
  minTouchTarget?: number;
  /** Mark dot diameter in px. */
  markSize?: number;
  /** Mark dot color. */
  markColor?: ColorKey;
  /** Typography role for the mark labels and the inline readout. */
  labelTypeface?: Typeface;
  /** Color of the mark labels and inline readout. */
  labelColor?: ColorKey;
  /** Tooltip background, for `valueDisplay="tooltip"`. */
  tooltipColor?: ContainerColorToken;
  /** Tooltip text color. */
  tooltipTextColor?: ColorKey;
  tooltipShadow?: Shadow;
  tooltipBorderRadius?: Radius;
  /**
   * Timing for the click-to-jump move, as a `motion` token. A drag is never
   * animated — a transition on a dragged thumb reads as lag — so this applies
   * to keyboard and track presses only. Defaults to `snap`.
   */
  motion?: Motion;
}
