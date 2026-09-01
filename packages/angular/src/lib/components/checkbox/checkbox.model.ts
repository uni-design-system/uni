import type { ColorKey } from '@uni-design-system/uni-core';

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
  size?: string | number;
  borderRadius?: string | number;
  /** Unchecked box background token. */
  boxColor?: ColorKey;
  focusRingGap?: string | number;
}
