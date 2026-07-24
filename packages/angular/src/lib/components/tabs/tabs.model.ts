import type {
  Border,
  ColorKey,
  OptionalSize,
  Radius,
  Thickness,
  Typeface,
} from '@uni-design-system/uni-core';

/**
 * Theme-level options for `uni-tabs`, resolved by token name. The defaults
 * render Material-style underline tabs; a theme can re-point the tokens to
 * get pills (`borderRadius: 'max'` + `activeColor`) or any custom treatment.
 */
export interface UniTabsOptions {
  /** Tab label typography. */
  typeface?: Typeface;
  /** Inactive tab label color. */
  textColor?: ColorKey;
  /** Active tab label color. */
  activeTextColor?: ColorKey;
  /** Active indicator (underline) color. */
  indicatorColor?: ColorKey;
  /** Active indicator height as a thickness token. */
  indicatorThickness?: Thickness;
  /** Rule under the whole tablist, as a border primitive token. */
  divider?: Border;
  /** Space between tabs, as a spacing token. */
  gap?: OptionalSize;
  /** Tab corner radius — 'max' plus `activeColor` gives segmented pills. */
  borderRadius?: Radius;
  /** Horizontal padding inside each tab, as a spacing token. */
  padding?: OptionalSize;
  /** Optional active tab background color (pill styles). */
  activeColor?: ColorKey;
}
