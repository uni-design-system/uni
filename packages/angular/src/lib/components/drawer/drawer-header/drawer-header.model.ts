import type {
  Border,
  ContainerColorToken,
  ContentColorToken,
  NullableSize,
  Size,
  TextRole,
} from '@uni-design-system/uni-core';
import type { IconName } from '../../icon/icon.record';

/**
 * Theme-level options for the drawer's pinned header row. Deliberately a
 * separate entry from `dialogHeader`: the two rows look alike but read
 * differently — a panel headline labels a region beside the page, where a
 * dialog's titles an interruption — so they want different defaults.
 */
export interface UniDrawerHeaderOptions {
  /** Row surface. Undefined inherits the drawer's own surface. */
  color?: ContainerColorToken;
  /** Fixed row height in px. */
  height?: number;
  /** Padding around the row, as a spacing token. */
  padding?: NullableSize;
  textRole?: TextRole;
  textColor?: ContentColorToken;
  textAlign?: 'left' | 'center' | 'right';
  /** Rule separating the header from the scrolling body, as a border primitive. */
  divider?: Border;
  closeButtonIcon?: IconName;
  closeButtonSymbol?: string;
  closeButtonSize?: Size;
}
