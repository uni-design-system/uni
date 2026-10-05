import { TemplateRef } from '@angular/core';
import type {
  Border,
  ColorKey,
  ContainerColorToken,
  Elevation,
  IconName,
  Motion,
  NullableSize,
  Radius,
  TextRole,
} from '@uni-design-system/uni-core';

/**
 * What a cell template receives: the row as `$implicit` (`let-row`), its
 * position on the page as `index`, and every field of the row by name
 * (`let-name="name"`). A row's own `index` field, if it has one, wins.
 */
export type UniDataTableCellContext<T> = T & { $implicit: T; index: number };

export interface ColumnDefinition<T> {
  columnDef: keyof T;
  header: string;
  cell?: (element: T) => string;
  isSticky?: boolean;
  template?: TemplateRef<UniDataTableCellContext<T>>;
  textAlign?: 'left' | 'right' | 'center';
  /**
   * Preferred column width, any CSS length or percentage. The table lays out
   * automatically, so this steadies a column rather than fixing it — content
   * too long to fit can still widen it.
   */
  width?: string;
  /** `false` renders a plain heading with no sort button. Defaults to `true`. */
  sortable?: boolean;
}

export interface UniDataTableOptions {
  /** Named motion primitive for the row hover transition. Defaults to `control`. */
  motion?: Motion;
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
  /** Block padding of header cells; overrides `thPadding` on that axis. */
  thPaddingVertical?: NullableSize;
  /** Inline padding of header cells; overrides `thPadding` on that axis. */
  thPaddingHorizontal?: NullableSize;
  /** Sort glyph, rotated half a turn for ascending. Defaults to `arrowUp`. */
  sortIcon?: IconName;
  thHorizontalBorder?: Border;
  thVerticalBorder?: Border;
  tdTextRole: TextRole;
  tdColor?: ContainerColorToken;
  tdStickyColor?: ContainerColorToken;
  tdPadding?: NullableSize;
  /** Block padding of body cells; overrides `tdPadding` on that axis. */
  tdPaddingVertical?: NullableSize;
  /** Inline padding of body cells; overrides `tdPadding` on that axis. */
  tdPaddingHorizontal?: NullableSize;
  tdHorizontalBorder?: Border;
  tdVerticalBorder?: Border;
  loadingOverlayColor?: ColorKey;
  loadingSpinnerColor?: ColorKey;
  loadingSpinnerSize?: string | number;
}
