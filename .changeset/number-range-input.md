---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

New `uni-number-range-input`: two linked numeric fields in one chrome with a
single `{ start, end }` value — price filters, thresholds, tolerances. This
completes the numeric family alongside `uni-number-input`,
`uni-quantity-stepper` and the rebuilt `uni-slider`.

```html
<uni-number-range-input label="Price range" currency="USD" [(value)]="price" [minGap]="50" />
```

`start`/`end` deliberately match `UniDateRange`, so the library has one range
vocabulary, and they never collide with the `min`/`max` **inputs**, which mean
the fence rather than the value.

**The rules that make it one field rather than two glued together:**

- **Either end alone is a valid value.** `{ start: 50 }` means "50 and up",
  which is a real filter. This is where it diverges from `uni-date-time-input`,
  whose two parts are two halves of one answer.
- **Stepping is fenced; typing swaps.** A stepper can never walk one end through
  the other — its wall is the other end, held off by `minGap`, and each end's
  `aria-valuemin`/`aria-valuemax` report that wall rather than the outer bounds.
  A *typed* backwards commit is swapped and announced instead, the rule
  `uni-calendar` applies to a backwards date range: clamping against the other
  end would destroy the number just entered.
- **`minGap` pushes the end you edited**, not the other one, which is what makes
  stepping behave as a fence rather than dragging the range along.
- A refused draft flags only the end it was typed into; the other stays valid.
- `preset`, `currency`, `prefix`, `suffix`, `decimals`, `grouping`, `locale` and
  `roundingMode` are forwarded to both ends so the halves always read alike.

It owns its commit path rather than nesting two `uni-number-input`s, because the
two behaviours above need *different* bounds — a stepper must be fenced at the
other end while a typed commit must arrive un-clamped — and a child field
applies one bound pair to both. The arithmetic, parsing and formatting are still
the shared `cdk/number` primitives.

Adds `numberRangeInput` to `ComponentName` with a theme entry (`partGap`,
`dividerText`, `dividerColor`). Field chrome is not duplicated there: colour,
border, radius and focus come from the shared `input` options via
`uni-input-box`. `dividerText` is literal punctuation rather than an icon token —
an en dash between two numbers is not a glyph a theme swaps artwork for.
