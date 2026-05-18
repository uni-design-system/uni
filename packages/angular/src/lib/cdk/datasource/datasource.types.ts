import { OuiBaseDatasource } from './base-datasource';
import { OuiRecordDatasource } from './record-datasource';
import { OuiServerSideDatasource } from './server-side-datasource';

export type OuiDatasource<T> = OuiBaseDatasource<T>;

export type { Sort, SortDirection } from './base-datasource';
export type {
  DataLoader,
  PageRequest,
  PageResponse,
} from './server-side-datasource';

export { OuiBaseDatasource, OuiRecordDatasource, OuiServerSideDatasource };
