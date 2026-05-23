import { IconName } from '../../components/icon/icon.record';
import type { ContainerColorToken, Variant } from '@uni-design-system/uni-core';

export interface Alert {
  message: string;
  iconName?: IconName;
  symbolName?: string;
  variant?: Variant;
  action?: () => void;
  actionLabel?: string;
  topPosition?: number;
}

export interface Snackbar {
  message: string;
  action?: () => void;
  actionLabel?: string;
  iconName?: IconName;
  symbolName?: string;
  variant?: Variant;
  timeout?: number | string | 'disabled';
}

export interface Confirmation {
  title: string;
  message: string;
  action: () => void;
  actionLabel?: string;
  dismissLabel?: string;
  color?: ContainerColorToken;
}
