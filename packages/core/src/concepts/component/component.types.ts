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
  | 'breadcrumb'
  | 'button'
  | 'buttonGroup'
  | 'calendar'
  | 'callout'
  | 'card'
  | 'cardContent'
  | 'cardHeader'
  | 'checkbox'
  | 'combobox'
  | 'dataSearch'
  | 'dataTable'
  | 'dateInput'
  | 'dateTimeInput'
  | 'dialog'
  | 'dialogButtons'
  | 'dialogHeader'
  | 'drawer'
  | 'drawerButtons'
  | 'drawerHeader'
  | 'dropdown'
  | 'expand'
  | 'footer'
  | 'iconButton'
  | 'input'
  | 'menu'
  | 'menuItem'
  | 'multiSelectDropdown'
  | 'notificationBadge'
  | 'numberInput'
  | 'numberRangeInput'
  | 'paginator'
  | 'popover'
  | 'quantityStepper'
  | 'radio'
  | 'searchInput'
  | 'select'
  | 'skeleton'
  | 'slider'
  | 'snackbar'
  | 'stat'
  | 'symbol'
  | 'tag'
  | 'tagInput'
  | 'progressBar'
  | 'progressGauge'
  | 'tabs'
  | 'textarea'
  | 'textButton'
  | 'timeInput'
  | 'toggle'
  | 'tooltip'
  | 'tour';

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
