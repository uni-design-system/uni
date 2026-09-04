import {
  type Border,
  type ContainerColorToken,
  ContentColorToken,
  type NullableSize,
  type Radius,
  Size,
  TextRole,
} from '@uni-design-system/uni-core';
import { IconName } from '../../icon/icon.record';

export interface UniDialogHeaderOptions {
  borderRadius?: Radius;
  color?: ContainerColorToken;
  height?: number;
  /** Horizontal inset of the header row, as a spacing token. */
  paddingHorizontal?: NullableSize;
  textRole: TextRole;
  textColor?: ContentColorToken;
  textAlign?: 'left' | 'center' | 'right';
  /** Border drawn under the pinned header, separating it from the scrolling body. */
  divider?: Border;
  closeButtonIcon?: IconName;
  closeButtonSymbol?: string;
  closeButtonSize?: Size;
}
