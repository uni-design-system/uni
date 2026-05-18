import { UniBaseDatasource } from './base-datasource';
import { UniRecordDatasource } from './record-datasource';
import { UniServerSideDatasource } from './server-side-datasource';

export type UniDatasource<T> = UniBaseDatasource<T>;

export type { Sort, SortDirection } from './base-datasource';
export type { DataLoader, PageRequest, PageResponse } from './server-side-datasource';

export { UniBaseDatasource, UniRecordDatasource, UniServerSideDatasource };
