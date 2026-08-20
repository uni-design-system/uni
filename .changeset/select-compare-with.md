---
'@uni-design-system/uni-angular': minor
---

`uni-select`: `compareWith` input for object values.

The select matched `value` against option values with `===`, so an object value that was structurally but not referentially equal — a saved record matched against options from a fresh fetch — never matched, and the native select silently rendered the first option (or the placeholder) instead of the preselection. The new `compareWith` input, called as `compareWith(optionValue, value)` and defaulting to reference equality, lets object-valued selects pass a key comparison like `(a, b) => a?.id === b?.id`. Primitive values were and remain unaffected.
