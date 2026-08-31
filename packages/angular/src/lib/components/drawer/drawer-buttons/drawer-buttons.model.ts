import type {
  Border,
  JustifyContent,
  NullableSize,
  Size,
  Variant,
} from '@uni-design-system/uni-core';

/**
 * Theme-level options for the drawer's pinned footer action row. Inputs on the
 * component override these per instance; the theme sets the default posture.
 *
 * Mirrors `UniDialogButtonsOptions` knob for knob, with a panel's posture
 * rather than a dialog's: trailing actions instead of centered ones, and a
 * divider against the scrolling body above.
 */
export interface UniDrawerButtonsOptions {
  /** Space between the action buttons, as a spacing token. */
  gap?: NullableSize;
  /** Padding around the row, as a spacing token. */
  padding?: NullableSize;
  justifyContent?: JustifyContent;
  confirmButtonVariant?: Variant;
  cancelButtonVariant?: Variant;
  /** Size passed to both buttons. */
  buttonSize?: Size;
  /** Rule separating the footer from the scrolling body, as a border primitive. */
  divider?: Border;
  /** When true the two actions share the full row width as equal halves. */
  stretch?: boolean;
  /** Render cancel before confirm (confirm ends up on the trailing edge). */
  reverseOrder?: boolean;
}
