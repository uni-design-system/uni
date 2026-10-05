---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

Data table refinements from the Wellsourced adoption.

- **Phantom scrollbar fixed**: a right-aligned last column no longer grows a horizontal scrollbar. The sort arrow now sits on the leading side of the label in right-aligned columns, and header cells clip the arrow instead of letting it widen the scroll area.
- **`ColumnDefinition`**: `width` (a preferred column width) and `sortable` (default `true`; `false` renders a plain heading with no sort button or `aria-sort`).
- **Cell templates** receive the row as `$implicit` and its `index`, alongside the row's fields by name, so `let-row` works and existing `let-name="name"` templates are unchanged. The context type is exported as `UniDataTableCellContext<T>`.
- **`dataTable` theme options**: `thPaddingVertical` / `thPaddingHorizontal` and `tdPaddingVertical` / `tdPaddingHorizontal` override `thPadding` / `tdPadding` per axis; `sortIcon` picks the sort glyph (default `arrowUp`).
- **`uni-sort-header`**: `iconName` and `align` inputs.
