---
'@uni-design-system/uni-angular': minor
---

`uni-multi-select-dropdown`: a real accessible name, keyboard navigation, debounced filtering — and its first specs

This was the weakest component in the library on exactly the axes the roadmap's
combobox item names, and it had **no spec file at all**, which is why the
missing accessible name survived since it was written.

- **New `label` input, and the trigger finally names the field.** Its
  accessible name now reads "Fruits, 2 selected, Apple, Cherry". Previously it
  announced only the current selection — a screen reader user heard
  "Option 1, Option 3" with no way to tell which field it belonged to. The
  selection count comes along, so "how many did I pick" is not left to counting
  commas.
- **Arrow keys, Home and End walk the options** from anywhere in the panel,
  including the filter box. Reaching the last of thirty options previously
  meant thirty `Tab` presses. Wrapping and the index arithmetic come from the
  CDK's shared `ListboxNavigation`, so the keys behave exactly as they do in
  `uni-search-input` and `uni-tag-input`.
- **The filter is debounced** (new `debounceTime`, default 200ms) instead of
  re-filtering on every keystroke — the open item in TODO.md.
- **An empty filter result says so** through `role="status"`, rather than
  leaving the panel blank.
- **The options are grouped** as a `role="group"` labelled from `label`.
- **20 specs**, covering the accessible name, selection and toggling, disabled
  behaviour, filtering and debounce, keyboard navigation, and the form-control
  contract.

**A deliberate non-change:** the options stay real checkboxes rather than
becoming a multi-selectable `listbox`. APG notes that multi-select listboxes are
handled inconsistently across screen readers and suggests a checkbox group
instead, and real checkboxes keep each option's state announced natively — so
converting would have traded a well-supported pattern for a fashionable one,
and duplicated the checkbox's animated visual into this component where it
would drift.
