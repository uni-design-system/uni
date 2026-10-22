import type {
  AlignItems, Border, JustifyContent, NullableSize, Size, Variant } from '@uni-design-system/uni-core';

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
  /**
   * Cross-axis alignment of the row. Defaults to `center`, so a footnote —
   * one line of text beside a 36 or 44px button — sits on the button's
   * centre line rather than stretched to the row's top edge.
   */
  alignItems?: AlignItems;
  /** Border drawn above the pinned row, separating it from the scrolling body. */
  divider?: Border;
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
