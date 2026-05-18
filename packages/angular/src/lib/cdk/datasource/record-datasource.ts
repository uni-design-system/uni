import { computed, signal } from '@angular/core';
import { OuiBaseDatasource, Sort } from './base-datasource';

export class OuiRecordDatasource<T> extends OuiBaseDatasource<T> {
  private _pageNumber = signal(1);
  private _pageSize = signal<number>(0); // 0 = unpaginated (show all)

  initialRecords = signal<T[]>([]);
  override recordCount = computed(
    (): number => this.initialRecords().filter(this.filter()).length,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter = signal<(value: T) => boolean>((value) => true);

  override pageIndex = signal<number>(0);
  override pageSize = computed(() => this._pageSize());

  override pageCount = computed(() => {
    const pageSize = this.pageSize();
    return pageSize > 0 ? Math.ceil(this.recordCount() / pageSize) : 1;
  });

  override records = computed(() => {
    const { column, direction } = this.sort();
    const filter = this.filter();
    const pageSize = this.pageSize();

    let filteredRecords = this.initialRecords().filter(filter);

    // Apply sorting if specified
    if (column && direction !== 'indet') {
      filteredRecords = [...filteredRecords].sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];

        const isString = typeof valueA === 'string';
        const isAsc = direction === 'asc';

        return isString
          ? stringCompare(valueA as string, valueB as string, isAsc)
          : numberCompare(valueA as number, valueB as number, isAsc);
      });
    }

    // Apply pagination only if pageSize > 0
    if (pageSize > 0) {
      return filteredRecords.slice(this.startIndex(), this.endIndex());
    }

    // Return all records (unpaginated)
    return filteredRecords;
  });

  constructor(data: T[]) {
    super();
    this.initialRecords.set(data);
  }

  override sortRecords(sort: Sort<T>) {
    this.sort.set(sort);
  }

  override firstPage() {
    this.pageIndex.set(0);
  }

  override nextPage() {
    if (this.pageIndex() < this.pageCount() - 1) {
      this.pageIndex.update((i) => i + 1);
    }
  }

  override previousPage() {
    this.pageIndex.update((i) => (i > 1 ? i - 1 : 0));
  }

  override lastPage() {
    this.pageIndex.set(this.pageCount() - 1);
  }

  override jumpToPage(page: number) {
    const i = page - 1;
    if (i >= 0 && i < this.pageCount()) {
      this.pageIndex.set(i);
    }
  }

  override setPageSize(size: number) {
    this._pageSize.set(size);
    if (size > 0) {
      this._pageNumber.set(1);
      this.pageIndex.set(0);
    }
  }

  setFilter(filter: (value: T) => boolean) {
    this.filter.set(filter);
  }

  clearFilter() {
    this.filter.set(() => true);
  }
}

function stringCompare(a = 'zzz', b = 'zzz', isAsc: boolean): number {
  a = a.toString();
  b = b.toString();

  return isAsc
    ? a.localeCompare(b, undefined, { sensitivity: 'base' })
    : b.localeCompare(a, undefined, { sensitivity: 'base' });
}

function numberCompare(a = 0, b = 0, isAsc: boolean): number {
  return isAsc ? a - b : b - a;
}
