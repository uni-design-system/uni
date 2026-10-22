---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

`uni-data-table` gains a real selection column and an id-keyed, bindable detail row; the datasources gain a row identity.

- **`rowId` on the datasources** (`new UniRecordDatasource(rows, { rowId: (row) => row.id })`, also a third argument on `UniServerSideDatasource`, and settable afterwards): a stable identity for a row. Without one, rows are compared by reference, which never matches a row rebuilt from a fresh fetch — a realtime update that replaced the records emptied the selection. With one, `isSelected`, `toggleSelection` and the new `setSelected(rows, selected)` key by it, and so do the table's expanded row and its row tracking.
- **`useMultiSelect`** is read now (it was declared and wired to nothing): a leading checkbox column over the datasource's own `selections` — a header box that selects or clears every selectable row on the page, `indeterminate` while only some are, and a box per row. `selectableWhen` keeps rows out of it (a disabled box, skipped by select-all); `selectLabel` and `selectAllLabel` name the boxes; `selectionChange` reports the datasource's selection after a box changed it. A box is its own control: a click on it is never the row's click. Theme options `selectionColumnWidth` (40), `selectionCheckboxSize` (`sm`) and `selectedRowColor` (unset: no tint).
- **`expanded`**, a two-way model: the expanded row's `rowId`, or its page index when the datasource has none; `null` collapses all. A deep link can open a row before the records arrive, and a sort or re-fetch that reorders them keeps the same record open. **`expandableWhen`** names the rows that have a detail — the rest take no hover affordance and no `aria-expanded`, and a click on them only emits `rowClick`. **`rowClass`** adds a class per row. Rows with a detail carry `aria-expanded`.
- `expandedIndex` is now a read-only computed of the open row's page index, **deprecated** in favour of `expanded`; `toggleRow(index)` still works. Removed in 12.0.
