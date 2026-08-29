import type {
  ColorKey,
  ContainerColorToken,
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
 * Fill and thumb colour are deliberately **not** here — they are the `variant`
 * role pair, the same rule every other component follows, so `variant="warn"`
 * recolours a slider without a theme edit. The track is a groove rather than an
 * accent, so it stays a token.
 */
export interface UniSliderOptions {
  /** Track thickness in px. */
  trackHeight?: number;
  /** Unfilled track colour. */
  trackColor?: ContainerColorToken;
  /** Track radius token. */
  borderRadius?: Radius;
  /** Visual thumb diameter in px. The hit area is padded to `minTouchTarget`. */
  thumbSize?: number;
  /** Thumb radius token. */
  thumbBorderRadius?: Radius;
  /**
   * Minimum pointer target for a thumb, in px — WCAG 2.2 SC 2.5.8 floor. The
   * visual dot stays `thumbSize`; the transparent hit area grows to this.
   */
  minTouchTarget?: number;
  /** Mark dot diameter in px. */
  markSize?: number;
  /** Mark dot colour. */
  markColor?: ColorKey;
  /** Typography role for the mark labels and the inline readout. */
  labelTypeface?: Typeface;
  /** Colour of the mark labels and inline readout. */
  labelColor?: ColorKey;
  /** Tooltip background, for `valueDisplay="tooltip"`. */
  tooltipColor?: ContainerColorToken;
  /** Tooltip text colour. */
  tooltipTextColor?: ColorKey;
  tooltipShadow?: Shadow;
  tooltipBorderRadius?: Radius;
  /**
   * Click-to-jump transition in ms. A drag is never animated — a transition on
   * a dragged thumb reads as lag — so this applies to keyboard and track
   * presses only.
   */
  transitionMs?: number;
}
