---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Search input stripped back and made generic; debounce input dressed in the shared chrome

- **`uni-debounce-input`** now wears the themed input chrome via `uni-input-box`
  (color, border, typeface, focus ring) and gains `label` (accessible name),
  `placeholder`, `disabled`, `pre-input`/`post-input` attribute slots for adornments,
  ARIA passthroughs (`role`, `ariaExpanded`, `ariaControls`, `ariaActivedescendant`)
  for composite widgets, and `clear()`/`focus()` methods. Debounce behavior unchanged.
- **`uni-search-input` redesigned**: the opinionated solid-primary pill bar with the
  embedded `title-large` label is gone. It's now a standard themed field — decorative
  leading magnifier, clear button while a query exists (refocusing on clear), Enter
  emits `search`, Escape closes/clears.
- **Type-ahead added**: pass `suggestions` (refresh from `change`) and the field
  becomes an ARIA combobox — keyboard-navigable listbox (ArrowUp/Down, Enter selects,
  emitting `suggestionSelected` + `search`), `aria-activedescendant` wiring, focus-out
  closing. New `searchInput` theme options: `searchSymbol`, `clearSymbol`, suggestion
  list `listColor`/`listShadow`/`listBorderRadius`, `maxSuggestions`.
- Visual breaking change for SearchInput consumers (deliberate strip-back); code API
  is compatible (`label`/`width`/`change`/`search` retained; `label` is now the
  accessible name + placeholder fallback rather than displayed text).
