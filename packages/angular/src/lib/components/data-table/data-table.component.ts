import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  model,
  output,
  signal,
  type TemplateRef,
} from '@angular/core';
import { css } from '@emotion/css';
import { type RowKey, UniDatasource, UniServerSideDatasource } from '../../cdk';
import { fadeIn, Z_INDEX } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniCheckboxComponent } from '../checkbox/checkbox.component';
import { UniIconComponent } from '../icon';
import { UniBoxDirective, UniCenterDirective } from '../layout';
import { UniScrollAreaComponent } from '../scroll-area/scroll-area.component';
import { UniSortHeaderComponent } from '../sort-header/sort-header.component';
import { UniTextDirective } from '../text/text.directive';
import {
  ColumnDefinition,
  type UniDataTableCellContext,
  type UniDataTableOptions,
} from './data-table.models';

/**
 * Data grid over a `UniDatasource`: sortable headers, a leading selection
 * column, and an expandable detail row per record.
 *
 * Rows are addressed by the datasource's `rowId` where it has one — so a
 * selection survives a re-fetch that rebuilds the records, and the expanded
 * row follows its record through a sort — and by reference (selection) or
 * page index (expansion) where it has none.
 */
@Component({
  selector: 'uni-data-table',
  imports: [
    NgTemplateOutlet,
    UniBoxDirective,
    UniCheckboxComponent,
    UniScrollAreaComponent,
    UniTextDirective,
    UniSortHeaderComponent,
    UniIconComponent,
    UniCenterDirective,
  ],
  templateUrl: './data-table.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'dataTable' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniDataTableComponent<T> extends BaseComponent<UniDataTableOptions> {
  datasource = input.required<UniDatasource<T>>();
  columns = input.required<ColumnDefinition<T>[]>();

  detailRowTemplate = input<TemplateRef<{ $implicit: T; index: number }>>();

  /**
   * The expanded row, two-way: its `rowId` when the datasource has one, else
   * its index on the page. `null` collapses every row. Keyed by id, a deep
   * link can open a row before the records arrive, and a sort or a realtime
   * reorder keeps the same record open.
   */
  expanded = model<RowKey | null>(null);

  /**
   * Which rows have a detail to open. A row that fails it takes no hover
   * affordance and no `aria-expanded`, and a click on it only emits
   * `rowClick`. Defaults to every row.
   */
  expandableWhen = input<(row: T) => boolean>();

  /** Extra class per row — to dim a delivered order, say. */
  rowClass = input<(row: T) => string>();

  /**
   * Draw a leading checkbox column over the datasource's `selections`: a
   * header box that selects or clears every selectable row on the page
   * (`indeterminate` while only some are), and a box per row.
   */
  useMultiSelect = input<boolean>(false);
  /** Which rows may be selected. The rest render a disabled box and are skipped by select-all. */
  selectableWhen = input<(row: T) => boolean>();
  /** Accessible name of a row's checkbox; a function names it per row. */
  selectLabel = input<string | ((row: T) => string)>('Select row');
  /** Accessible name of the header checkbox. */
  selectAllLabel = input('Select all rows');
  /** The datasource's selection after a checkbox changed it — the same array `selections()` holds. */
  selectionChange = output<T[]>();

  useRowClick = input<boolean>(true);
  highlight? = input<(row: T) => boolean>();

  height = input<string>();
  scrollable = signal(false);

  /** Row hover answers the pointer; the overlay arrives; a detail row reveals. */
  private readonly motion = computed(() =>
    this.theme.motion(this.componentOptions().motion ?? 'control')
  );
  private readonly overlayMotion = computed(() => this.theme.motion('notification'));
  private readonly revealMotion = computed(() => this.theme.motion('reveal'));

  protected readonly loadingOverlayClass = computed(() =>
    css({
      animation: `fadeIn ${this.overlayMotion().duration}ms ${this.overlayMotion().easing}`,
      '@keyframes fadeIn': { ...fadeIn },
    })
  );

  rowSelect = output<T>();
  rowClick = output<T>();

  protected readonly tableClass = computed(() =>
    css({
      ...this.theme.colorPair(this.componentOptions().color),
      width: '100%',
      borderSpacing: 0,
    })
  );

  protected readonly headerClass = computed(() =>
    css({
      borderBottom: this.getBorder(this.componentOptions().thHorizontalBorder),

      '&:empty': {
        display: 'none',
      },
    })
  );

  protected readonly footerClass = computed(() =>
    css({
      borderTop: this.getBorder(this.componentOptions().thHorizontalBorder),

      '&:empty': {
        display: 'none',
      },
    })
  );

  protected readonly thClass = computed(() =>
    css({
      ...this.theme.colorPair(this.componentOptions().thColor),

      position: 'sticky',
      top: 0,
      textAlign: 'center',
      padding: 0, // Reset renderers default padding

      ...this.theme.padding(this.componentOptions().thPadding),
      ...this.theme.verticalPadding(this.componentOptions().thPaddingVertical),
      ...this.theme.horizontalPadding(this.componentOptions().thPaddingHorizontal),
      // The sort arrow hangs outside its label. Where a column is too narrow
      // to hold it, it is clipped here rather than widening the scroll area
      // into a horizontal scrollbar with nothing to scroll.
      overflow: 'hidden',

      borderBottom: this.getBorder(this.componentOptions().thHorizontalBorder),
      '&:not(:last-child)': {
        borderRight: this.getBorder(this.componentOptions().thVerticalBorder),
      },
      '&:last-child.scrollable': {
        paddingRight: 29,
      },
      '&.sticky': {
        position: 'sticky',
        left: 0,
        zIndex: Z_INDEX.sticky,
      },
    })
  );

  protected readonly tdClass = computed(() =>
    css([
      {
        textAlign: 'center',
        padding: 0, // Reset renderers default padding
        '&:not(:last-child)': {
          borderRight: this.getBorder(this.componentOptions().tdVerticalBorder),
        },
        '&:last-child.scrollable': {
          // The last scrollable column allows space for the scrollbar.
          paddingRight: 29,
        },
        '&.sticky': {
          position: 'sticky',
          left: 0,
          zIndex: Z_INDEX.sticky,
          ...this.theme.colorPair(this.componentOptions().tdStickyColor),
        },
        '&:not(.template)': {
          // Allow templates to define their own styles
          ...this.theme.padding(this.componentOptions().tdPadding),
          ...this.theme.verticalPadding(this.componentOptions().tdPaddingVertical),
          ...this.theme.horizontalPadding(this.componentOptions().tdPaddingHorizontal),
        },
      },
    ])
  );

  protected readonly trClass = computed(() => {
    const selected = this.componentOptions().selectedRowColor;
    return css(
      {
        '& td': {
          ...this.theme.backgroundColor('transparent'),
          transition: `all ${this.motion().duration}ms ${this.motion().easing}`,
        },
        ':not(:last-child) td': {
          borderBottom: this.getBorder(this.componentOptions().tdHorizontalBorder),
        },
      },
      // A row with nothing to open takes no affordance; `rowClick` still fires.
      this.useRowClick() && {
        '&:not(.inexpandable):hover td': {
          ...this.theme.backgroundColor(this.componentOptions().rowHoverColor),
          cursor: 'pointer',
        },
      },
      selected && {
        '&.selected td': { ...this.theme.backgroundColor(selected) },
      }
    );
  });

  protected readonly detailRowClass = computed(() =>
    css({
      display: 'table-row',
      visibility: 'hidden',
      '&.expanded': {
        visibility: 'visible',
      },
      '& td': {
        padding: 0,
        borderBottom: this.getBorder(this.componentOptions().tdHorizontalBorder),
      },
      '& td .detail-content-wrapper': {
        display: 'grid',
        gridTemplateRows: '0fr',
        transition: `grid-template-rows ${this.revealMotion().duration}ms ${this.revealMotion().easing}`,
        overflow: 'hidden',

        '& .detail-inner': {
          minHeight: 0,
        },
      },
      '&.expanded td .detail-content-wrapper': {
        gridTemplateRows: '1fr',
      },
    })
  );

  // Loading state detection
  isLoading = linkedSignal(() => {
    const datasource = this.datasource();
    if (datasource && datasource instanceof UniServerSideDatasource) {
      // For server-side datasource, use the built-in loading state
      return datasource.isLoading();
    } else {
      // For client-side datasource, no loading state needed
      return false;
    }
  });

  /** A row's key for expansion and tracking: its `rowId`, else its page index. */
  protected keyOf(row: T, index: number): RowKey {
    const rowId = this.datasource().rowId;
    return rowId ? rowId(row) : index;
  }

  protected isExpanded(row: T, index: number): boolean {
    return this.expanded() === this.keyOf(row, index);
  }

  protected isExpandable(row: T): boolean {
    return this.expandableWhen()?.(row) ?? true;
  }

  /**
   * The page index of the expanded row, or null.
   *
   * @deprecated Read or bind `expanded` instead, which is keyed by `rowId`
   * and survives a sort. Removed in 12.0.
   */
  readonly expandedIndex = computed<number | null>(() => {
    const key = this.expanded();
    if (key === null) return null;
    const index = this.datasource()
      .records()
      .findIndex((row, i) => this.keyOf(row, i) === key);
    return index < 0 ? null : index;
  });

  /** Expand or collapse the row at `index` on the page. */
  toggleRow(index: number) {
    const row = this.datasource().records()[index];
    if (row === undefined) return;
    const key = this.keyOf(row, index);
    this.expanded.update((current) => (current === key ? null : key));
  }

  handleRowClick(row: T, index: number) {
    this.rowClick.emit(row);
    if (this.isExpandable(row)) this.toggleRow(index);
  }

  /** Classes for a record row: the themed row plus the consumer's own. */
  protected rowClasses(row: T): string {
    const extra = this.rowClass()?.(row);
    return extra ? `${this.trClass()} ${extra}` : this.trClass();
  }

  // --- Selection -------------------------------------------------------------

  protected isSelectable(row: T): boolean {
    return this.selectableWhen()?.(row) ?? true;
  }

  /** The rows on the page that may be selected — what the header box governs. */
  protected readonly selectableRows = computed(() =>
    this.datasource()
      .records()
      .filter((row) => this.isSelectable(row))
  );

  protected readonly allSelected = computed(() => {
    const rows = this.selectableRows();
    const ds = this.datasource();
    ds.selections();
    return rows.length > 0 && rows.every((row) => ds.isSelected(row));
  });

  protected readonly someSelected = computed(() => {
    const ds = this.datasource();
    ds.selections();
    return !this.allSelected() && this.selectableRows().some((row) => ds.isSelected(row));
  });

  protected rowSelectLabel(row: T): string {
    const label = this.selectLabel();
    return typeof label === 'function' ? label(row) : label;
  }

  protected toggleSelect(row: T) {
    const ds = this.datasource();
    ds.toggleSelection(row);
    this.rowSelect.emit(row);
    this.selectionChange.emit(ds.selections());
  }

  protected toggleAll() {
    const ds = this.datasource();
    ds.setSelected(this.selectableRows(), !this.allSelected());
    this.selectionChange.emit(ds.selections());
  }

  /** Columns a detail row spans: the defined ones plus the selection column. */
  protected readonly columnCount = computed(
    () => this.columns().length + (this.useMultiSelect() ? 1 : 0)
  );

  /**
   * The selection column's width, on the header cell: auto table layout
   * hands the slack to columns with no stated width, so stated here the
   * column stays this wide and the data columns absorb the rest.
   */
  protected readonly selectionColumnWidth = computed(() => {
    const width = this.componentOptions().selectionColumnWidth ?? 40;
    return typeof width === 'number' ? `${width}px` : width;
  });

  protected readonly selectionCellClass = computed(() =>
    css({
      display: 'inline-block',
      textAlign: 'center',
      '& uni-checkbox': { verticalAlign: 'middle' },
    })
  );

  /**
   * One context per row for the cell templates, rebuilt only when the records
   * change. The row's own fields are spread last-but-one so `let-name="name"`
   * keeps resolving (and a row's own `index` wins over its position).
   */
  protected readonly cellContexts = computed<UniDataTableCellContext<T>[]>(() =>
    this.datasource()
      .records()
      .map((record, index) => ({ index, ...record, $implicit: record }))
  );

  /** aria-sort value for a column header, or null when the column is unsorted. */
  protected ariaSort(column: ColumnDefinition<T>): 'ascending' | 'descending' | null {
    const ds = this.datasource();
    if (!ds || column.sortable === false || ds.sortColumn() !== column.columnDef) return null;
    const direction = ds.sortDirection();
    return direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : null;
  }

  isHighlighted(row: T) {
    const callback = this.highlight && this.highlight();
    if (!callback) return false;
    return callback(row);
  }

  protected readonly String = String;

  handleScrollable(scrollable: boolean) {
    this.scrollable.set(scrollable);
  }

  getBorder(name: string | undefined) {
    return name ? this.theme.theme().borders[name] : undefined;
  }
}
