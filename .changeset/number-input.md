---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

New `uni-number-input`: the field for a quantity, a price, a percentage or a
measurement, with locale-aware parsing, `Intl` formatting on commit,
prefix/suffix adornments, min/max/step fences and steppers that hold to repeat.

```html
<uni-number-input label="Quantity" [(value)]="qty" [min]="1" />
<uni-number-input label="Unit price" currency="USD" [(value)]="price" />
```

**Why not `<input type="number">`.** Per the HTML value sanitization algorithm,
a number input whose text is not a valid floating-point number reports
`value === ''`. Type `12,50` as most of Europe does, or paste `1,234.56` from a
spreadsheet, and the app reads an empty field with no way to tell that from a
blank one — a data-loss bug, and the reason this is `type="text"` with
`role="spinbutton"`. The platform control also cannot group thousands, cannot
place an affix outside the editable text, has ~10px unstyleable spinners below
the WCAG 2.2 target minimum, changes value on the scroll wheel while focused,
and steps in floats.

**What it does instead.**

- **Presets** — `decimal`, `integer`, `currency`, `percent` — supply decimals,
  grouping, affix and `inputmode` together, so a money field is `label`,
  `currency="USD"`, `[(value)]`. `numberFormat` is the escape hatch, merged over
  the preset.
- **Parses what people actually type**: canonical ASCII always, locale grouping
  (`1.234,56` in German), pasted affixes and currency symbols, accounting
  negatives `(1,234.56)`, localized digit systems, compact `1.5k`, and — behind
  `allowExpressions` — spreadsheet arithmetic like `12*3`, via a shunting-yard
  parser that never calls `eval`.
- **Unreadable text stays in the field**, flagged with a dashed underline and a
  `rejected` event, rather than being silently swallowed.
- **Exact arithmetic.** Stepping `0.1` twenty times from `0` lands on exactly
  `2`; `1.15` rounds to `1.2` where `(1.15).toFixed(1)` gives `'1.1'`. A second
  `valueAsString` model carries digits a `number` cannot, and a dev-mode warning
  fires when a bound `value` cannot round-trip.
- **Percent never divides behind your back**: `preset="percent"` shows `15%` for
  `15`. Models that really are fractions set `valueIsFraction`.
- Clamping on commit rather than per keystroke, visible fences that disable the
  matching stepper and announce, `wrap` for cyclic fields, `emptyStepValue`,
  four stepper layouts, and hold-to-repeat that announces once on release.

`uni-slider` gains `valueDisplay="input"`, which seats one of these as its
readout — drag for the ballpark, type for the exact value.

Adds `numberInput` to `ComponentName` with a theme entry. Field chrome is not
duplicated there: colour, border, radius and focus come from the shared `input`
options via `uni-input-box`, so a number field restyles with every other field.
