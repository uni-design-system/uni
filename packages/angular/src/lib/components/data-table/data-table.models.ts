import { TemplateRef } from '@angular/core';
import type {
  Border,
  ColorKey,
  ContainerColorToken,
  Elevation,
  NullableSize,
  Radius,
  TextRole,
} from '@uni-design-system/uni-core';

export interface ColumnDefinition<T> {
  columnDef: keyof T;
  header: string;
  cell?: (element: T) => string;
  isSticky?: boolean;
  template?: TemplateRef<T>;
  textAlign?: 'left' | 'right' | 'center';
}

export interface UniDataTableOptions {
  border?: Border;
  borderRadius?: Radius;
  color?: ContainerColorToken;
  elevation?: Elevation;
  headerPadding?: NullableSize;
  footerPadding?: NullableSize;
  headerColor?: ContainerColorToken;
  footerColor?: ContainerColorToken;
  cellPadding?: NullableSize;
  rowHoverColor?: ContainerColorToken;
  thTextRole: TextRole;
  thColor?: ContainerColorToken;
  thPadding?: NullableSize;
  thHorizontalBorder?: Border;
  thVerticalBorder?: Border;
  tdTextRole: TextRole;
  tdColor?: ContainerColorToken;
  tdStickyColor?: ContainerColorToken;
  tdPadding?: NullableSize;
  tdHorizontalBorder?: Border;
  tdVerticalBorder?: Border;
  loadingOverlayColor?: ColorKey;
  loadingSpinnerColor?: ColorKey;
  loadingSpinnerSize?: string | number;
}
