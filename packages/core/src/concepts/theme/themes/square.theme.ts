import { type UniTheme } from '../theme.model';
import { BaseTheme } from './base.theme';
import { Button } from '../../button';

const SquareBaseButton: Button = {
  borderRadius: 3,
  color: 'primary-container',
  contentColor: 'on-primary-container',
  verticalPadding: { xxs: 2, xs: 5, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  horizontalPadding: { xxs: 4, xs: 8, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 },
};

export const SquareTheme: UniTheme = {
  ...BaseTheme,
  id: 'SquareTheme',
  name: 'Square Theme',
  buttons: {
    elevated: {
      ...SquareBaseButton,
      color: 'surface',
      contentColor: 'on-surface',
      shadowElevation: 'raised',
    },
    filled: {
      ...SquareBaseButton,
      color: 'primary',
    },
    'filled-secondary': {
      ...SquareBaseButton,
      color: 'secondary',
      contentColor: 'on-secondary',
    },
    outlined: {
      ...SquareBaseButton,
      color: 'transparent',
      borderColor: 'primary',
      contentColor: 'on-primary',
      borderWidth: 1,
    },
    text: {
      ...SquareBaseButton,
      color: 'transparent',
      contentColor: 'on-surface',
    },
    icon: {
      ...SquareBaseButton,
      color: 'transparent',
      contentColor: 'on-surface',
    },
    'floating-action': {
      ...SquareBaseButton,
      color: 'secondary',
      contentColor: 'on-secondary',
      borderRadii: { xxs: 3, xs: 5, sm: 8, md: 12, lg: 16, xl: 12, xxl: 20 },
      shadowElevation: 'navigation',
      verticalPadding: { xxs: 4, xs: 8, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 },
      horizontalPadding: { xxs: 4, xs: 8, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 },
    },
  },
};
