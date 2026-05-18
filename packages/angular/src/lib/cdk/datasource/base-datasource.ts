import { computed, signal, Signal, WritableSignal } from '@angular/core';

export type SortDirection = 'asc' | 'desc' | 'indet';

export interface Sort<T> {
  column?: keyof T;
  direction: SortDirection;
}

export abstract class OuiBaseDatasource<T> {
  abstract records: Signal<T[]>;
  abstract recordCount: Signal<number>;

  selections = signal<T[]>([]);

  sort: WritableSignal<Sort<T>> = signal({
    column: undefined,
    direction: 'indet',
  });

  sortColumn = computed(() => this.sort().column);
  sortDirection = computed(() => this.sort().direction);

  abstract pageIndex: Signal<number>;
  abstract pageSize: Signal<number>;
  abstract pageCount: Signal<number>;

  pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, index) => index + 1),
  );

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
    return this.selections().some((selection) => selection === row);
  }

  toggleSelection(row: T) {
    this.selections.update((selections) => {
      return selections.includes(row)
        ? selections.filter((i) => i !== row)
        : [...selections, row];
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
