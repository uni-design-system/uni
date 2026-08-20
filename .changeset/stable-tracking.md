---
'@uni-design-system/uni-angular': patch
---

`uni-menu`, `uni-multi-select`, `uni-data-table`: stop tracking loop collections by identity (NG0956).

`uni-menu` items, `uni-multi-select` options, and `uni-data-table` records tracked by object identity, so a consumer rebuilding the array each change-detection pass — the natural way to write `[menuItems]="[...]"` or re-fetch table rows — recreated every DOM node and tripped NG0956. They now track by `$index` (none of these collections carries a stable key: menu items may be templates or dividers, option values may be objects, records are arbitrary), and data-table columns track by their unique `columnDef`. Consumers no longer need to memoize a stable array; DOM nodes — including a focused menu item — survive a rebuild.
