import type { ColorKey, NullableSize } from '@uni-design-system/uni-core';

/** Which end of the range a rejection or a change came from. */
export type UniNumberRangePart = 'start' | 'end';

/** A refused commit on one end. The raw text stays in that part. */
export interface UniNumberRangeRejection {
  part: UniNumberRangePart;
  raw: string;
  reason: 'unparseable' | 'not-integer';
}

/**
 * Theme-level options for `uni-number-range-input`.
 *
 * Field chrome — colour, border, radius, focus outline — is not duplicated
 * here; it comes from the shared `input` options via `uni-input-box`, so a
 * range field restyles with every other field. These are the composer's own.
 */
export interface UniNumberRangeInputOptions {
  /** Space between each part and the divider. */
  partGap?: NullableSize;
  /**
   * Text between the two ends. Literal punctuation, not an icon token — an en
   * dash between two numbers is not a glyph a theme swaps artwork for.
   */
  dividerText?: string;
  dividerColor?: ColorKey;
  /** Colour of each part's prefix/suffix adornment. */
  affixColor?: ColorKey;
  /** Space between an adornment and its number. */
  affixGap?: NullableSize;
}
