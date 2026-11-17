import type { Border, ColorKey, OptionalSize, Radius, Typeface } from '@uni-design-system/uni-core';

/** How a swatch is drawn — see `uni-color-swatch`'s `face` input. */
export type UniColorSwatchFace = 'chip' | 'tile' | 'card' | 'dot';

/**
 * Theme options for the `colorSwatch` entry. The block's color is never one
 * of them: it is the given `hex` in every scheme. The block's edge per size
 * lives in the entry's `sizes` block (`{ sm: { height: 14 }, … }`).
 */
export interface UniColorSwatchOptions {
  /**
   * Border primitive around the block. It is the guarantee a swatch reads as
   * a swatch whatever its color — a near-white on a light surface, a
   * near-black on a dark one — so re-point it; do not remove it.
   */
  border?: Border;
  borderRadius?: Radius;
  /** Space between the block and its text. */
  gap?: OptionalSize;
  nameTypeface?: Typeface;
  detailTypeface?: Typeface;
  /** Ink of the detail and the caption. */
  detailColor?: ColorKey;
  captionTypeface?: Typeface;
  /** Fill of a block with no `hex`, under its hairline diagonal. */
  emptyColor?: ColorKey;
}
