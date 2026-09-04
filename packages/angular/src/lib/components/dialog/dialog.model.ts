import type {
  Border,
  ContainerColorToken,
  Elevation,
  NullableSize,
  Radius,
  StyleExpression,
} from '@uni-design-system/uni-core';

export interface UniDialogOptions {
  border: Border;
  borderRadius: Radius;
  color: ContainerColorToken;
  elevation: Elevation;
  backdrop: StyleExpression;
  /**
   * Insets the whole surface: the pinned header, the scrolling body and the
   * pinned buttons all sit inside it. Safe on a surface that never scrolls —
   * the dialog is `overflow: clip` and only its body row scrolls.
   */
  padding?: NullableSize;
  /**
   * Padding on the scrolling body row alone. Distinct from `padding`, which
   * insets all three rows.
   */
  bodyPadding?: NullableSize;
  /**
   * Minimum gap between the surface and the viewport edge. The dialog is
   * content-sized up to `calc(100dvh - 2 x inset)` and scrolls its body from
   * there.
   */
  inset?: NullableSize;
}
