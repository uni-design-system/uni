import type { Size } from '../size';
import type { ColorKey } from '../theme';

export type ComponentName =
  | 'undefined'
  | 'alert'
  | 'badge'
  | 'button'
  | 'buttonGroup'
  | 'card'
  | 'cardContent'
  | 'cardHeader'
  | 'checkbox'
  | 'dataSearch'
  | 'dataTable'
  | 'dialog'
  | 'dialogHeader'
  | 'dropdown'
  | 'footer'
  | 'iconButton'
  | 'input'
  | 'multiSelectDropdown'
  | 'notificationBadge'
  | 'paginator'
  | 'select'
  | 'slider'
  | 'snackbar'
  | 'progressBar'
  | 'progressGauge'
  | 'textButton'
  | 'toggle'
  | 'tooltip';

export interface ComponentTheme<T = object> {
  fixed?: StyleExpression;
  colors?: Partial<Record<ColorKey, StyleExpression>>;
  sizes?: Partial<Record<Size, StyleExpression>>;
  options?: T;
}

export type ComponentThemes = Partial<Record<ComponentName, ComponentTheme>>;

export type StyleExpression = Record<string, string | number | undefined>;
export type NullableStyleExpression = StyleExpression | undefined;
