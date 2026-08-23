import { TemplateRef } from '@angular/core';
import type {
  Motion,
  ColorKey,
  ContainerColorToken,
  NullableSize,
  Radius,
  Typeface,
  Variant,
} from '@uni-design-system/uni-core';

interface BaseMenuItem {
  symbolName?: string;
  action?: () => void;
  /** Tone routed through the theme's `menuItem.variants` (e.g. 'warn' for destructive actions). */
  variant?: Variant;
  disabled?: boolean;
}

export interface MenuItemWithLabel extends BaseMenuItem {
  label: string;
  template?: never;
  context?: never;
  divider?: never;
}

export interface MenuItemWithTemplate<T = any> extends BaseMenuItem {
  label?: never;
  template: TemplateRef<T>;
  context: T;
  divider?: never;
}

/** A non-interactive separator between item groups; styled by the theme's `menu` options. */
export interface MenuDivider {
  divider: true;
}

export type MenuItem<T = any> = MenuDivider | MenuItemWithLabel | MenuItemWithTemplate<T>;

export const isDivider = (item: MenuItem): item is MenuDivider => 'divider' in item;

/** Theme options for the `menuItem` component entry. */
export interface UniMenuItemOptions {
  height?: number;
  paddingHorizontal?: NullableSize;
  gap?: NullableSize;
  borderRadius?: Radius;
  typeface?: Typeface;
  /** Resting text color; undefined inherits the panel's on-color. */
  textColor?: ColorKey;
  hoverColor?: ContainerColorToken;
  /** Trailing symbol marking the active item; undefined/'' renders none. */
  activeSymbol?: string;
  /** Named motion primitive for the hover/focus fill. Defaults to `control`;
      omit both this and `transitionSpeed` for no transition at all. */
  motion?: Motion;
  /**
   * Hover/focus transition in seconds; 0 switches instantly.
   *
   * @deprecated Use `motion` and retime the `control` token instead. Still
   * honoured when set, and wins over `motion`. Removed next major.
   */
  transitionSpeed?: number;
}
