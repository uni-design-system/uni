import { TemplateRef } from '@angular/core';

interface BaseMenuItem {
  symbolName?: string;
  action?: () => void;
}

export interface MenuItemWithLabel extends BaseMenuItem {
  label: string;
  template?: never;
  context?: never;
}

export interface MenuItemWithTemplate<T = any> extends BaseMenuItem {
  label?: never;
  template: TemplateRef<T>;
  context: T;
}

export type MenuItem<T = any> = MenuItemWithLabel | MenuItemWithTemplate<T>;
