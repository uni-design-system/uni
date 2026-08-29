---
'@uni-design-system/uni-angular': patch
---

`uni-tag-input`'s first chip no longer rides the left border.

The themed leading inset was applied by `uni-input-box` to the inner `<input>`,
which is the field's leading edge only while it is empty. Once a chip existed,
the chip sat flush against the border while the text after it stayed indented.
The chip row now owns the inset — it is the leading content — via the
`managedInset` input added alongside `uni-number-input`, so the first chip and
an empty field's placeholder both start at the same 8px as every other field's
text. Wrapped chip rows are unaffected; vertical padding already handled those.
