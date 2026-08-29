---
'@uni-design-system/uni-angular': patch
---

Three cosmetic fixes in the numeric family.

**`uni-quantity-stepper`'s dividers were heavier than its frame.** The rules
either side of the value took `dividerColor: 'outline'` — a solid grey — against
an outer border of the 8%-alpha `light` token, so the control read as three
pieces stuck together rather than one frame. They now take the **same `border`
token as the container** and move with it on focus, so a focused stepper is not
accented on the outside and grey down the middle. `dividerColor` remains as an
opt-in override for a deliberately distinct rule, and is unset in the base theme.

**`uni-quantity-stepper` had no focus state.** Every other field gets its focus
chrome from `uni-input-box`, which the stepper deliberately does not use — and
its inner input clears its own outline via `removeInputPlatformStyling`, so
focusing the middle showed nothing at all. The container now carries the same
`:has(input:focus)` rule and the same `input` theme tokens the box applies
(`focusOutline`, `focusOutlineOffset`, and the optional `focusBorder` /
`focusShadow` / `focusColor`), so a stepper highlights exactly like the field
beside it — including in themes such as Wellsourced that express focus as a
border and ring rather than an outline. Error state still wins, keeping a
flagged control visibly flagged while it is corrected.

**A trailing suffix sat against the right border.** The leading inset was
already handled, so the two sides did not match. `uni-number-range-input` — which
has no steppers — now insets both edges of its row, and `uni-number-input` insets
the trailing edge whenever no stepper occupies it (`stepperLayout="none"`, or a
read-only field). Where a stepper *is* present the trailing edge is still left
to it, because a button is meant to reach the border.

Both insets ride the row rather than the `<input>`: `uni-input-box` styles
`& input` at a higher specificity than a component class can reach, so padding
set on the input itself is silently dropped.
