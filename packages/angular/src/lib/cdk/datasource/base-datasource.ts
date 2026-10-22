import { computed, signal, Signal, WritableSignal } from '@angular/core';

export type SortDirection = 'asc' | 'desc' | 'indet';

/** What `rowId` returns: a stable identity for a row across re-fetches. */
export type RowKey = string | number;

/** Options shared by every datasource. */
export interface UniDatasourceOptions<T> {
  /**
   * Stable identity for a row. Unset, rows are compared by reference, which
   * never matches a row rebuilt from a fresh fetch — a realtime update that
   * replaces the records would empty a selection and move an expanded row.
   * Set it (`(row) => row.id`) and selection, `uni-data-table`'s expanded row
   * and its row tracking all key by it instead.
   */
  rowId?: (row: T) => RowKey;
}

export interface Sort<T> {
  column?: keyof T;
  direction: SortDirection;
}

export abstract class UniBaseDatasource<T> {
  abstract records: Signal<T[]>;
  abstract recordCount: Signal<number>;

  selections = signal<T[]>([]);

  /** See `UniDatasourceOptions.rowId`. Settable after construction. */
  rowId?: (row: T) => RowKey;

  /** The row's identity: its `rowId`, or the row itself when there is none. */
  rowKey(row: T): RowKey | T {
    return this.rowId ? this.rowId(row) : row;
  }

  sort: WritableSignal<Sort<T>> = signal({
    column: undefined,
    direction: 'indet',
  });

  sortColumn = computed(() => this.sort().column);
  sortDirection = computed(() => this.sort().direction);

  abstract pageIndex: Signal<number>;
  abstract pageSize: Signal<number>;
  abstract pageCount: Signal<number>;

  pages = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index + 1));

  startIndex = computed(() => {
    const pageSize = this.pageSize();
    const pageIndex = this.pageIndex();
    return pageSize > 0 ? pageIndex * pageSize : 0;
  });

  endIndex = computed(() => {
    const pageSize = this.pageSize();
    const total = this.recordCount();

    // If unpaginated (pageSize = 0), return total count
    if (pageSize === 0) {
      return total;
    }

    const start = this.startIndex();
    return Math.min(start + pageSize, total);
  });

  disablePrevious = computed(() => {
    const pageSize = this.pageSize();
    return pageSize === 0 ? true : this.pageIndex() === 0;
  });

  disableNext = computed(() => {
    const pageSize = this.pageSize();
    return pageSize === 0 ? true : this.pageIndex() + 1 >= this.pageCount();
  });

  truncatedPages = computed(() => {
    const currentPage = this.pageIndex() + 1;
    const displayRange = 3;
    const totalPages = this.pageCount();

    const pages: (number | string)[] = [];
    const startPage = Math.max(1, currentPage - displayRange);
    const endPage = Math.min(totalPages, currentPage + displayRange);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  });

  isSelected(row: T): boolean {
    const key = this.rowKey(row);
    return this.selections().some((selection) => this.rowKey(selection) === key);
  }

  toggleSelection(row: T) {
    this.setSelected([row], !this.isSelected(row));
  }

  /**
   * Select or deselect several rows at once — a select-all over the rows
   * that may be selected, leaving any others (another page's) as they are.
   * Keyed by `rowId`, so a selected row re-fetched as a new object is
   * replaced rather than duplicated.
   */
  setSelected(rows: T[], selected: boolean) {
    const keys = new Set(rows.map((row) => this.rowKey(row)));
    this.selections.update((selections) => {
      const kept = selections.filter((selection) => !keys.has(this.rowKey(selection)));
      return selected ? [...kept, ...rows] : kept;
    });
  }

  clearSelections() {
    this.selections.set([]);
  }

  selectAll() {
    this.selections.set([...this.records()]);
  }

  abstract sortRecords(sort: Sort<T>): void;
  abstract firstPage(): void;
  abstract nextPage(): void;
  abstract previousPage(): void;
  abstract lastPage(): void;
  abstract jumpToPage(page: number): void;
  abstract setPageSize(size: number): void;
}
