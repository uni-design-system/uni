---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

Selection, hover and density become theme decisions on `uni-tag`, and add `uni-tag-group`.

`uni-tag` had the right axes but made the app do the work. `selected` painted nothing — it set `aria-pressed` and swapped the lead glyph — so every toggle chip in app markup carried a `[tone]="on() ? 'solid' : 'soft'"` of its own. Interactive chips had no hover state at all. The selected check was added rather than reserved, so picking a chip reflowed the whole row.

**Selection paints itself.** A selected chip adds a `tag-selected` class and an interactive one adds `tag-interactive`, both as much public theme contract as `&.tone-*` already was. The base theme's `tag` variants use them: selection promotes a chip to its role's solid pair at every tone (`solid` deepens instead of refilling), and `&.tag-interactive:hover` is a `brightness(0.95)` wash that darkens fill, ink and edge together. A theme restyling either writes the rules per variant, beside the colours they belong to.

**A toggle chip holds the check's place.** Bind `selected` and the chip reserves the glyph's footprint while unselected, so picking one never resizes it. A chip that already has a lead needs no slot — the check replaces the avatar or icon at identical width.

**`uni-tag-group`** is a row of chips the user picks from. It renders its own chips from `items` and owns the two things an app was otherwise wiring per chip: which one is selected (`value`, plus `multiple`) and which one holds the tab stop. Keyboard model is the toolbar pattern — one tab stop for the whole row, arrow keys within it, on both axes because the row wraps. `layout="justify"` stretches each filled row flush to both edges and leaves the last row at its natural widths, the way justified text leaves its last line alone. It is themed as **`tagGroup`** (`gap`, `rowGap`, `chipSize`, `chipTone`, `chipVariant`), layout only — every colour decision stays on the chips, so a group restyles with them.

**Visual changes to every existing chip**, including the chips inside `uni-tag-input`:

- A lead element and the remove control now **tuck into the rounded end** instead of starting where the radius ends — each sits concentric with the curve it is in, so a small status dot sits further in than a full lead box. A lead is balanced against, so the **label sits centred**; the tuck costs less than the old gutter did, so that balance is largely paid for rather than added. A remove control is not balanced against on its own, since it reads as an affordance rather than as content — a chip with nothing but a remove button keeps its gutter and simply tucks the glyph. A chip whose ends are too square to flow into (`borderRadius: 'xs'`) keeps the size token's gutter at both ends.
- The `tag` typeface drops from **weight 600 to 500**. Geometry is unchanged; what made these chips read louder than the ones they replaced was the weight, not the size.
- `border-color` and `filter` join the transition list, so an outline↔solid change fades its edge instead of snapping while the fill animates, and the hover wash fades in.

New `tag` theme option **`endInset`** (`number | 'auto'`) sets how far that tuck goes; `auto` derives it from the chip so the lead sits concentric with the cap. The `tag` size tokens now state `paddingInline` rather than a `padding` shorthand, since the chip reads that number back to balance the label — a theme still stating the shorthand is parsed as before.

`UniTagComponent` is now generic in its value (`UniTagComponent<T extends UniTagValue = UniTagValue>`), so `value`, `removed` and `activated` carry an app's own type and `$event` flows without a closure. The default type parameter leaves every existing use compiling unchanged.
