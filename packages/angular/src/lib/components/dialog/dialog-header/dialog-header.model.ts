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
  closeButtonSize?: Size;
  /**
   * Surface of a `rich` head. Unset (the default) inherits the dialog's own
   * surface: a head that is part of the sheet rather than a pill on it.
   */
  richColor?: ContainerColorToken;
  /** Padding of a `rich` head. Defaults to `md`; `paddingHorizontal` still outranks it sideways. */
  richPadding?: NullableSize;
}
