---
'@uni-design-system/uni-angular': minor
---

Home and End now move the caret in the combobox-style controls —
`uni-combobox`, `uni-search-input`, `uni-tag-input` — instead of jumping to
the ends of the suggestion list. APG reserves those keys for text editing in
an editable combobox, and a field that claims them makes its own text
un-navigable exactly when you are most likely to be editing it: with the list
open. `uni-time-input` already behaved this way.

Nothing is lost. ArrowUp on a closed list already opens it on the last option,
ArrowDown on the first, and navigation wraps at both ends, so every position
Home/End reached is still one keystroke away.

`uni-multi-select-dropdown` keeps them: its roving focus rides the option
checkboxes rather than a text field, so there is no caret with a better claim.

`ListboxNavigation` carries the switch as `homeEndNavigates`, defaulting to
false — off is the right default for a control built around a text input,
which is every consumer but one. If you build on the CDK helper directly and
want the old behavior, pass `homeEndNavigates: true`.

This also fixes a sharper bug in `uni-search-input` and `uni-tag-input`, where
Home/End reached the navigation helper unconditionally: pressing either not
only moved the active option but *opened a closed suggestion list*.
