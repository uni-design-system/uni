import type { ColorKey, Motion, NullableSize, Typeface } from '@uni-design-system/uni-core';

/**
 * What a variant means for a checkbox, as theme data the component reads.
 *
 * The accent lands in five places — the box outline, the checked border, the
 * checked and indeterminate fills, and the focus ring — so it cannot be a
 * single applied style without naming interior classes in the theme. Naming
 * the role instead keeps `.checkbox-box` and `.checkbox-check` private.
 */
export interface UniCheckboxVariant {
  /** Box outline, checked fill and focus ring. */
  accent: ColorKey;
  /**
   * The tick and dash, which draw on top of the accent fill. Defaults to the
   * accent's paired `on-` token; set it where no such pair exists.
   */
  onAccent?: ColorKey;
}

export interface UniCheckboxOptions {
  /** Named motion primitive for the box, tick and dash transitions. Defaults to `control`. */
  motion?: Motion;
  /**
   * One box size for every instance, outranking the `sizes` block.
   *
   * @deprecated State the geometry per size token in the component theme's
   * `sizes` block (`{ sm: { height: 16 }, ... }`) so a control's `size` input
   * can reach it. Kept because it is what every theme written before 11.2
   * says, and removing it silently would resize those apps; a theme that sets
   * it still wins everywhere. Removed in 12.0.
   */
  size?: string | number;
  borderRadius?: string | number;
  /** Unchecked box background token. */
  boxColor?: ColorKey;
  focusRingGap?: string | number;
  /**
   * Typeface role for the rendered label. Defaults to `label`.
   *
   * It is a role, not a set of type properties, because the label beside a
   * checkbox is ordinary copy in one theme's scale and a caption in another's
   * — `label` is the caption above a field in most type scales, which is the
   * wrong voice for a sentence the user reads.
   */
  textRole?: Typeface;
  /** Ink for the rendered label. Unset inherits the surrounding on-color. */
  textColor?: ColorKey;
  /** Space between the box and its label. Defaults to `sm`. */
  gap?: NullableSize;
}
