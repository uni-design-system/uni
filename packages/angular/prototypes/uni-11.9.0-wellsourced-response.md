# Response: the 11.9.0 batch — data-table selection and the expanded row

**For:** Wellsourced
**From:** Uni Design System dev team
**Re:** `data-table-selection-2026-10-10.md`
**Date:** 2026-10-22

All four asks, with one placement decision explained. With these and the
11.7.0 refinements, `app-data-table` can go and Orders moves to
`uni-data-table` as Clients did.

---

## Identity: `rowId`, on the datasource

You offered `rowId` on the table *or* the datasource. It is on the datasource,
because that is where `selections` lives: `isSelected` compared by reference
(`selection === row`), and the datasource is the thing that has to stop doing
so. `new UniRecordDatasource(rows, { rowId: (row) => row.id })` — a third
argument on `UniServerSideDatasource`, and settable afterwards as
`datasource.rowId = …`. With it, `isSelected`, `toggleSelection` and a new
`setSelected(rows, selected)` key by id; the table reads the same function for
its expanded row and its `@for` tracking, so one declaration covers all three.
Your Orders page rebuilds its rows after every realtime update; a selection and
an open row both survive that now.

## §1 — the selection column

`useMultiSelect` is read. It draws a leading column of `uni-checkbox
labelHidden size="sm"`: a header box that selects or clears every selectable
row on the page — `indeterminate` while only some are — and a box per row,
wired to the datasource's own `selections`. `selectableWhen(row)` keeps rows
out (a disabled box, skipped by select-all); a page with nothing selectable
disables the header box. `selectLabel` (a string or a per-row function) and
`selectAllLabel` name the boxes. `selectionChange` reports the datasource's
selection after a box changed it; binding `selections()` directly is the
documented alternative, and either is the same array.

A box is its own control: a click or a Space on it stops at the cell, so it is
never the row's click and never toggles the detail row.

Theme: `selectionColumnWidth` (40), `selectionCheckboxSize` (`sm`), and
`selectedRowColor` — unset by default, since the box says it; set a container
token to tint the row.

## §2 — the expanded row

`expanded` is a two-way model holding the open row's `rowId` — or its page
index when the datasource has none, which is what the old internal signal held.
`null` collapses every row. A deep link can set it before the records arrive;
a sort or a re-fetch that reorders the records keeps the same record open; the
row carries `aria-expanded`.

`expandableWhen(row)` gates the detail: a row that fails it takes no hover
affordance and no `aria-expanded`, and a click on it still emits `rowClick` —
your `clickableWhen`, under the name that says what it decides. `rowClass(row)`
adds a class per row, for the delivered rows you dim.

`expandedIndex` survives as a read-only computed of the open row's page index,
deprecated for `expanded` and removed in 12.0; `toggleRow(index)` still works.

## Your test idea

It is the spec, nearly verbatim: three rows with ids, `useMultiSelect` on,
`selectableWhen` false for the middle one — the header box is indeterminate
after selecting row 1, select-all selects rows 1 and 3 only, replacing the
records array with equal ids keeps the selection, `[(expanded)]="'o2'"` opens
row 2 and a sort that moves it keeps it open.

## What is still open, in order

1. `uni-card` as an Emotion class with `selected` / `interactive` states
   (`card-theme-state-2026-10-09.md`); the group is a scope decision.
2. Tour target resolver and lazy retry, `targetMissing`
   (`tour-and-callout-2026-10-14.md` §2).
3. Color roles (`theme-color-roles-2026-10-10.md`), then the phone input.

Parked decisions: combobox `allowCustom` / `displayWith`; callout default
faces; the card group's scope; data-table §2 templated-cell padding.

## Verification

1,277 tests, 30 new across the table and the datasource, each written to fail
on revert. Lint, type-check and the build are green; `llms.txt` is regenerated.
In Storybook, in Chrome: the header box reads indeterminate then checked, a
delivered row's box is disabled and skipped, a box click opens no detail, a
re-fetch keeps the selection, and the open row follows its record through a
sort.
