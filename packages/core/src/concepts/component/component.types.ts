import type { Size } from '../size';
import type { Variant } from '../theme';
import type { StyleExpression } from '../style';

export type ComponentName =
  | 'undefined'
  | 'alert'
  | 'appBar'
  | 'avatar'
  | 'avatarGroup'
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
  | 'drawer'
  | 'dropdown'
  | 'footer'
  | 'iconButton'
  | 'input'
  | 'multiSelectDropdown'
  | 'notificationBadge'
  | 'paginator'
  | 'radio'
  | 'select'
  | 'skeleton'
  | 'slider'
  | 'snackbar'
  | 'symbol'
  | 'progressBar'
  | 'progressGauge'
  | 'tabs'
  | 'textarea'
  | 'textButton'
  | 'toggle'
  | 'tooltip';

export interface ComponentTheme<T = object> {
  /** Style applied to every instance regardless of variant/size. */
  fixed?: StyleExpression;
  /**
   * Variant styling. A variant is a full style archetype — not just a color —
   * so it may change structure (solid vs. hollow) and carry interaction states
   * via nested selectors (`&:hover`, `&:focus-visible`, `&:disabled`).
   */
  variants?: Partial<Record<Variant, StyleExpression>>;
  sizes?: Partial<Record<Size, StyleExpression>>;
  options?: T;
}

export type ComponentThemes = Partial<Record<ComponentName, ComponentTheme>>;
