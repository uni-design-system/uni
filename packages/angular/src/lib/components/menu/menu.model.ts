import type {
  Border,
  ColorKey,
  ContainerColorToken,
  NullableSize,
  Radius,
  Shadow,
  Typeface,
} from '@uni-design-system/uni-core';

/**
 * Theme options for the `menu` component entry. The panel-chrome fields
 * (color/border/borderRadius/shadow) fall back to the theme's `dropdown`
 * options when undefined, so menus follow generic popovers until a theme
 * deliberately splits them.
 */
export interface UniMenuOptions {
  /** Panel minimum width in px; undefined sizes to the widest item. */
  minWidth?: number;
  color?: ContainerColorToken;
  border?: Border;
  borderRadius?: Radius;
  shadow?: Shadow;
  paddingVertical?: NullableSize;
  paddingHorizontal?: NullableSize;
  dividerBorder?: Border;
  /** Vertical margin and horizontal inset applied to dividers. */
  dividerSpacing?: NullableSize;
  /** Typeface of a group heading (`{ heading: '…' }` items). */
  headingTypeface?: Typeface;
  /** Text color of a group heading; undefined inherits the panel's on-color. */
  headingColor?: ColorKey;
  /** Height of a group heading in px. */
  headingHeight?: number;
  /** Horizontal padding of a group heading; undefined follows
      `menuItem.paddingHorizontal`, so heading and item text align. */
  headingPaddingHorizontal?: NullableSize;
}
