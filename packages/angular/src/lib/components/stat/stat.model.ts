import type { Border, ColorKey, ContainerColorToken, OptionalSize, Radius, Typeface } from '@uni-design-system/uni-core';

/** Theme-level options for `uni-stat`, resolved by token name. */
export interface UniStatOptions {
  /** Label typography token (muted, small). */
  labelTypeface?: Typeface;
  /** Value typography token — defaults to the type scale's `stat` role. */
  valueTypeface?: Typeface;
  /** Tile surface color token. */
  color?: ContainerColorToken;
  /** Frame as a border primitive token. */
  border?: Border;
  /** Corner radius token. */
  borderRadius?: Radius;
  /** Delta ink when the movement is good. */
  positiveColor?: ColorKey;
  /** Delta ink when the movement is bad. */
  negativeColor?: ColorKey;
  /** Sparkline stroke color. */
  trendColor?: ColorKey;
  /** Sparkline endpoint color. */
  trendAccent?: ColorKey;
  /** Inner padding, as a spacing token. */
  padding?: OptionalSize;
  /** Vertical gap between rows, as a spacing token. */
  gap?: OptionalSize;
}
