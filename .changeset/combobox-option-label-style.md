---
'@uni-design-system/uni-angular': minor
---

`uni-combobox`: an option may set its own label type, and the list says when
it opens and closes.

- `Option.labelStyle` (`fontFamily`, `fontWeight`, `fontStyle`) draws that
  option's label in its own type, so a typeface list can show each face. The
  description and the row keep the theme's type and height, and the accessible
  name is unchanged. While a styled option is committed the field shows its
  label in the same type; a draft returns to the theme's input type.
  `uni-select` and the multi-select controls ignore the field.
- New outputs `opened` and `closed` fire once per real transition, by any
  route, and `closed` never fires without a preceding `opened`. Use `opened`
  to load what the rows need, such as font files.
