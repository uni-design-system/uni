---
'@uni-design-system/uni-angular': patch
---

`uni-combobox` docs: "Allowing new values" — free text never commits implicitly (closed-set contract: typing filters, a non-matching draft reverts with `(rejected)`). The supported create-new pattern is now documented with a working story: drive `[options]` from the debounced `(query)` with `[filterLocally]="false"` and, when nothing matches exactly, append a sentinel option — `{ label: `Create "${text}"`, value: … }`. As a real option it commits through every normal path (arrow + Enter, click, Enter when the filter narrows to it alone); resolve it in `(selected)` by minting the entity and writing the model. Blur intentionally never commits the sentinel — creation takes an explicit Enter or click. Lighter alternative: listen to `(rejected: { query })` and offer creation outside the control. If most values are user-created, use `uni-tag-input` (open set) instead.
