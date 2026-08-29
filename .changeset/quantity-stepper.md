---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

New `uni-quantity-stepper`: `− 3 +` for cart lines, table cells and seat counts
— the numeric core with no field chrome, no label and no room for either.

```html
<uni-quantity-stepper label="Quantity, Blue T-shirt (M)" [(value)]="qty" [min]="1" />
```

A separate component rather than a `chrome="bare"` flag on `uni-number-input`,
because this control is defined by what it does *not* have — presets, affixes,
expressions, four stepper layouts — and eight inputs are easier to write
correctly than forty plus a list of which ones to leave alone. The arithmetic,
parsing and hold-to-repeat come from the same `cdk/number` primitives, so
`1,200` and the keyboard map behave identically in both.

- **`deleteAtMin`** is the cart pattern in one attribute: at the floor the
  decrement becomes a remove affordance, renamed `Remove {label}`, and emits
  `removed` rather than stepping to zero. Without it every shop reimplements the
  same `value === 1 ? remove() : step(-1)` branch outside the component. (The
  spec called this output `emptied`; that is a native `HTMLMediaElement` event
  name, which `@angular-eslint/no-output-native` rightly rejects, and `removed`
  is already what `uni-tag` calls the same request.)
- The middle is a real input by default — typing `12` beats tapping `+` eleven
  times, and it takes the same grouped and locale-aware entry the field does.
  `editable=false` renders the number as text for read-mostly tables, and the
  buttons become the tab stops since there is nothing else to focus.
- `size` is `sm` / `md` / `lg` at 24 / 32 / 40px *outer* height, so an `md`
  stepper lines up with a 32px field beside it, with the buttons square at that
  height. `md` and `lg` clear the 24×24 pointer target of WCAG 2.2 SC 2.5.8;
  `sm` leaves 22px inside its border and is the dense desktop option.

Adds `quantityStepper` to `ComponentName` with a theme entry. Unlike the other
numeric controls it does **not** inherit the shared `input` chrome — it is not a
field — so it carries its own container tokens, defaulted to the same values
`input` uses so a cart stepper and a form field look related out of the box.
Height comes from the entry's `sizes` block rather than an option.
