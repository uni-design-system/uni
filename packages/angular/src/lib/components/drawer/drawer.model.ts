import type {
  Border,
  ContainerColorToken,
  Elevation,
  OptionalSize,
  StyleExpression,
} from '@uni-design-system/uni-core';

/** How the drawer coexists with page content. */
export type DrawerMode = 'side' | 'over';

/** Which edge the drawer attaches to (logical: start = left in LTR). */
export type DrawerPosition = 'start' | 'end';

/** Theme-level options for `uni-drawer`, resolved by token name. */
export interface UniDrawerOptions {
  /** Panel surface color token (with its paired on-color). */
  color?: ContainerColorToken;
  /** Panel width in px. */
  width?: number;
  /** Edge rule separating a side drawer from content, as a border primitive. */
  divider?: Border;
  /** Elevation shadow token for the overlay mode. */
  elevation?: Elevation;
  /** Inner padding, as a spacing token. */
  padding?: OptionalSize;
  /** Backdrop styling for the overlay mode. */
  backdrop?: StyleExpression;
}
