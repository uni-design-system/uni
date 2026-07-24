import type {
  Border,
  ContainerColorToken,
  Elevation,
  OptionalSize,
  Typeface,
} from '@uni-design-system/uni-core';

/** Theme-level options for `uni-app-bar`, resolved by token name. */
export interface UniAppBarOptions {
  /** Bar surface color token (with its paired on-color). */
  color?: ContainerColorToken;
  /** Bar height in px. */
  height?: number;
  /** Rule under the bar, as a border primitive token. */
  divider?: Border;
  /** Title typography token. */
  typeface?: Typeface;
  /** Horizontal padding, as a spacing token. */
  padding?: OptionalSize;
  /** Space between bar children, as a spacing token. */
  gap?: OptionalSize;
  /** Optional elevation shadow token (e.g. 'raised'). */
  elevation?: Elevation;
}
