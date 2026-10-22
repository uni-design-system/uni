/**
 * Selection identity. Rows are arbitrary consumer objects, typically
 * re-fetched as fresh references — a realtime update that rebuilt the
 * records used to empty the selection, because `isSelected` compared by
 * reference. `rowId` keys it instead.
 */
import { UniRecordDatasource } from './record-datasource';

interface Order {
  id: string;
  status: string;
}

const ORDERS: Order[] = [
  { id: 'a', status: 'ready' },
  { id: 'b', status: 'ready' },
  { id: 'c', status: 'delivered' },
];

describe('UniBaseDatasource selection', () => {
  it('compares by reference without a rowId, as before', () => {
    const ds = new UniRecordDatasource<Order>([...ORDERS]);
    ds.toggleSelection(ORDERS[0]);
    expect(ds.isSelected(ORDERS[0])).toBe(true);
    expect(ds.isSelected({ ...ORDERS[0] })).toBe(false);
  });

  it('keys by rowId, so a re-fetched row stays selected', () => {
    const ds = new UniRecordDatasource<Order>([...ORDERS], { rowId: (row) => row.id });
    ds.toggleSelection(ORDERS[0]);

    const refetched = ORDERS.map((row) => ({ ...row }));
    ds.initialRecords.set(refetched);
    expect(ds.isSelected(refetched[0])).toBe(true);
    expect(ds.isSelected(refetched[1])).toBe(false);
  });

  it('toggles a re-fetched row off by key rather than adding a duplicate', () => {
    const ds = new UniRecordDatasource<Order>([...ORDERS], { rowId: (row) => row.id });
    ds.toggleSelection(ORDERS[0]);
    ds.toggleSelection({ ...ORDERS[0] });
    expect(ds.selections()).toEqual([]);
  });

  it('setSelected adds or removes several rows, leaving the rest alone', () => {
    const ds = new UniRecordDatasource<Order>([...ORDERS], { rowId: (row) => row.id });
    ds.toggleSelection(ORDERS[2]);

    ds.setSelected([ORDERS[0], ORDERS[1]], true);
    expect(ds.selections().map((row) => row.id)).toEqual(['c', 'a', 'b']);

    ds.setSelected([{ ...ORDERS[0] }, ORDERS[1]], false);
    expect(ds.selections().map((row) => row.id)).toEqual(['c']);
  });

  it('setSelected replaces a selected row re-fetched as a new object, not duplicating it', () => {
    const ds = new UniRecordDatasource<Order>([...ORDERS], { rowId: (row) => row.id });
    ds.setSelected([ORDERS[0]], true);
    const fresh = { ...ORDERS[0], status: 'packed' };
    ds.setSelected([fresh], true);
    expect(ds.selections()).toEqual([fresh]);
  });

  it('rowId is settable after construction', () => {
    const ds = new UniRecordDatasource<Order>([...ORDERS]);
    ds.rowId = (row) => row.id;
    ds.toggleSelection(ORDERS[1]);
    expect(ds.isSelected({ ...ORDERS[1] })).toBe(true);
  });
});
