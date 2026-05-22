import {
  type ContainerColorToken,
  ContentColorToken,
  type Radius,
  Size,
  TextRole,
} from '@uni-design-system/uni-core';
import { IconName } from '../../icon/icon.record';

export interface UniDialogHeaderOptions {
  borderRadius?: Radius;
  color?: ContainerColorToken;
  height?: number;
  textRole: TextRole;
  textColor?: ContentColorToken;
  textAlign?: 'left' | 'center' | 'right';
  closeButtonIcon?: IconName;
  closeButtonSymbol?: string;
  closeButtonSize?: Size;
}
