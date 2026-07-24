import type { ColorKey, Radius } from '@uni-design-system/uni-core';

/** Theme-level options for `uni-slider`, resolved by token name. */
export interface UniSliderOptions {
  /** Fill and thumb color. */
  color?: ColorKey;
  /** Unfilled track color. */
  trackColor?: ColorKey;
  /** Track and thumb radius token. */
  borderRadius?: Radius;
  /** Track height in px. */
  trackHeight?: number;
  /** Thumb diameter in px. */
  thumbSize?: number;
}
