---
'@uni-design-system/uni-angular': patch
---

`uni-quantity-stepper` no longer claims ~230px of width it does not need.

The value cell is a native `<input>`, which defaults to `size="20"`. Its
`flex: 1 1 auto` meant `flex-basis` resolved to that intrinsic ~20-character
width rather than to `valueWidth`, so the control measured ~230px instead of the
~92px its buttons and a 3ch value actually need. Worse, that inflated width is
the control's `auto` size, and a `1fr` grid track is `minmax(auto, 1fr)` — so a
stepper stole track width from whatever sat beside it in a grid. Reported by
Wellsourced, who worked around it with `uni-quantity-stepper input { width: 0 }`.

The input is now sized from its content (`size` bound to the rendered value's
length), so the intrinsic width tells the truth. `valueWidth` stays the floor via
`min-width`, which is what keeps stepping 9 → 10 from reflowing the row, and the
cell still grows past it with the digits — measured at 92px for one to three
digits, 116px at `12,000`, 140px at `1,234,567`.

This is deliberately not the `width`-instead-of-`min-width` fix that was also
suggested: a fixed cell would have pinned the value at `valueWidth` and clipped
longer numbers, losing the growth the option documents.

**For consumers carrying the workaround:** it is safe to leave in place — the
control measures the same 92px either way — but remove it to get the growth
back, since `width: 0` forces `flex-basis: 0` and pins the cell at the floor.
