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

export interface ComponentTheme<T = object, V = object> {
  /** Style applied to every instance regardless of variant/size. */
  fixed?: StyleExpression;
  /**
   * Variant styling. A variant is a full style archetype — not just a color —
   * so it may change structure (solid vs. hollow) and carry interaction states
   * via nested selectors (`&:hover`, `&:focus-visible`, `&:disabled`).
   *
   * This is CSS, and it is *applied*: the theme service spreads it onto the
   * component's element. For a control whose accent lands on several interior
   * elements at once, see {@link ComponentTheme.variantOptions}.
   */
  variants?: Partial<Record<Variant, StyleExpression>>;
  /**
   * Per-variant data the component *reads*, rather than CSS that is applied.
   *
   * The selection controls need one accent colour in four to seven interior
   * places — a checkbox's box outline, checked fill, indeterminate fill, tick
   * stroke and focus ring. Expressing that as a `variants` StyleExpression
   * would mean nested selectors naming `.checkbox-check` and `.radio-inner`,
   * which promotes private DOM to public theme contract. Naming the colour role
   * once and letting the component place it keeps that internal.
   *
   * Never spread as CSS — the keys are role names, not CSS properties.
   */
  variantOptions?: Partial<Record<Variant, V>>;
  sizes?: Partial<Record<Size, StyleExpression>>;
  options?: T;
}

export type ComponentThemes = Partial<Record<ComponentName, ComponentTheme>>;
