import type { JustifyContent, NullableSize, Size, Variant } from '@uni-design-system/uni-core';

/**
 * Theme-level options for the dialog footer action row. Inputs on the
 * component override these per instance; the theme sets the default posture.
 */
export interface UniDialogButtonsOptions {
  /** Space between the action buttons, as a spacing token. */
  gap?: NullableSize;
  /** Padding around the row, as a spacing token. */
  padding?: NullableSize;
  /** Bottom padding, as a spacing token. */
  paddingBottom?: NullableSize;
  justifyContent?: JustifyContent;
  confirmButtonVariant?: Variant;
  cancelButtonVariant?: Variant;
  /** Size passed to both buttons. */
  buttonSize?: Size;
  /**
   * When true the two actions share the full row width as equal halves —
   * the Carbon/enterprise footer posture. Button height/alignment styling
   * can ride along via the component theme's `fixed` style.
   */
  stretch?: boolean;
  /** Render cancel before confirm (confirm ends up on the right edge). */
  reverseOrder?: boolean;
}
