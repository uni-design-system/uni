---
'@uni-design-system/uni-angular': patch
'@uni-design-system/uni-core': patch
---

`uni-menu`: a labeled item takes an optional `description`, secondary text
that trails the label on the same line, as combobox options do. The item keeps
its themed height and typeahead still matches the label. Its color is the new
`menuItem.descriptionColor` theme option (`on-surface-variant` in the base
theme); a disabled item's description takes the disabled color.
