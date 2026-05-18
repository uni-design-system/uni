import {
  computed,
  linkedSignal,
  resource,
  ResourceLoaderParams,
  ResourceRef,
  type ResourceStatus,
  signal,
} from '@angular/core';
import { OuiBaseDatasource, Sort, SortDirection } from './base-datasource';

export interface PageRequest {
  pageNumber: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: SortDirection;
  filter?: Record<string, any>;
}

export interface PageResponse<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}

export type DataLoader<T> = (request: PageRequest) => Promise<PageResponse<T>>;

export class OuiServerSideDatasource<T> extends OuiBaseDatasource<T> {
  private _pageNumber = signal(1);
  private _pageSize = signal(10);
  private _sortColumn = signal<keyof T | undefined>(undefined);
  private _sortDirection = signal<SortDirection>('indet');
  private filter = signal<Record<string, any>>({});

  override sortColumn = computed(() => this._sortColumn());
  override sortDirection = computed(() => this._sortDirection());

  private totalRecords = signal(0);

  private dataResource: ResourceRef<PageResponse<T> | undefined>;

  override pageIndex = computed(() => this._pageNumber() - 1);
  override pageSize = computed(() => this._pageSize());

  override pageCount = computed(() => {
    const total = this.totalRecords();
    const size = this.pageSize();
    return total > 0 ? Math.ceil(total / size) : 0;
  });

  private readonly _records = linkedSignal<
    {
      val: PageResponse<T> | undefined;
      status: ResourceStatus;
    },
    T[]
  >({
    source: () => ({
      val: this.dataResource.value(),
      status: this.dataResource.status(),
    }),
    computation: (source, previous) => {
      if (source.status === 'loading' && previous) {
        return previous.value;
      }
      return source.val?.data ?? [];
    },
  });

  override records = this._records.asReadonly();

  override recordCount = computed(() => this.totalRecords());

  isLoading = computed(() => this.dataResource.isLoading());

  error = computed(() => this.dataResource.error());

  hasError = computed(
    () => this.dataResource.hasValue() === false && this.error() !== undefined,
  );

  constructor(
    private dataLoader: DataLoader<T>,
    initialPageSize = 10,
  ) {
    super();
    this._pageSize.set(initialPageSize);

    this.dataResource = resource({
      params: () => ({
        pageNumber: this._pageNumber(),
        pageSize: this._pageSize(),
        sortColumn: this._sortColumn() as string | undefined,
        sortDirection: this._sortDirection(),
        filter: this.filter(),
      }),
      loader: async (params: ResourceLoaderParams<PageRequest>) => {
        const request = params.params;
        const response = await this.dataLoader(request);

        if (request.pageNumber === 1 || this.totalRecords() === 0) {
          this.totalRecords.set(response.totalRecords);
        }

        return response;
      },
    });
  }

  override sortRecords(sort: Sort<T>) {
    this.sort.set(sort);
    this._sortColumn.set(sort.column);
    this._sortDirection.set(sort.direction);
    this._pageNumber.set(1);
  }

  override firstPage() {
    this._pageNumber.set(1);
  }

  override nextPage() {
    if (this._pageNumber() < this.pageCount()) {
      this._pageNumber.update((n) => n + 1);
    }
  }

  override previousPage() {
    if (this._pageNumber() > 1) {
      this._pageNumber.update((n) => n - 1);
    }
  }

  override lastPage() {
    this._pageNumber.set(this.pageCount());
  }

  override jumpToPage(page: number) {
    if (page >= 1 && page <= this.pageCount()) {
      this._pageNumber.set(page);
    }
  }

  override setPageSize(size: number) {
    if (size > 0) {
      this._pageSize.set(size);
      this._pageNumber.set(1);
    }
  }

  setFilter(filterValues: Record<string, any>) {
    this.filter.set(filterValues);
    this._pageNumber.set(1);
  }

  clearFilter() {
    this.filter.set({});
    this._pageNumber.set(1);
  }

  refresh() {
    this.dataResource.reload();
  }

  getPageRequest(): PageRequest {
    return {
      pageNumber: this._pageNumber(),
      pageSize: this._pageSize(),
      sortColumn: this._sortColumn() as string | undefined,
      sortDirection: this._sortDirection(),
      filter: this.filter(),
    };
  }
}
