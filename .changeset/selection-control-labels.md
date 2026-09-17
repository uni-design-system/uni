---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

The label on `uni-checkbox`, `uni-toggle` and `uni-radio` becomes a theme decision, can be named without being drawn, and can be replaced by content of your own.

All three rendered their label as `<span uni-text="label">` — a literal. `label` is the *caption above a field* in most type scales, so a theme that makes it an uppercase eyebrow, as several do, rendered every checkbox sentence as a 9px badge beside a 20px box, with nothing in the theme able to reach it. `uni-radio` was worse: the group heading and each option shared that one role, so a group had no hierarchy at all. New **`textRole`** and **`textColor`** options fix it, and radio gets a second pair, **`groupTextRole`** / **`groupTextColor`**, for the heading. Both default to `label`, so no existing theme moves.

**`labelHidden`** keeps `label` as the accessible name without drawing it — the select column, the row whose meaning is already on screen beside it. The string stays in the DOM, so a test querying by label text and a screen reader see the same words, and it renders through the shared `visuallyHidden` recipe, which is `position: fixed`: out of flow, so it claims none of the label row's `gap` and the control measures exactly its box. On radio it hides the group heading, which still carries the id `aria-labelledby` points at.

**`<ng-content />` now sits inside the control's own `<label>`.** HTML forbids nesting a `<label>`, so the natural markup for "the whole row toggles this" is illegal the moment the row contains a checkbox — leaving apps to write a `div` with a click handler, a `stopPropagation` so the row does not toggle twice, and the name passed twice. Project the row's content instead and it is one control, natively associated, whole-row clickable and keyboard-operable, with one tab stop. A radio group renders N labels from data and so has no single slot: it takes an **`<ng-template uniRadioOption let-option>`** instead, instantiated once per option, inside that option's `<label>`. **`fullWidth`** on all three stretches the hit area to its container.

**`gap`** is a spacing token now rather than a literal `8`, and radio's group column gets **`groupGap`** (unset stays at the 12px it has always drawn — not a step on the base scale, so resolving it as a token would warn on every miss).

**Checkbox and radio get a `sizes` block**, the mechanism `toggle.sizes` moved to in 11.1.0: a dense table wants a 16px box where the same app's forms want 20px, and one number per theme cannot say so. `lg` is `BaseComponent`'s default and reproduces today's 20px exactly. `options.size` is now `@deprecated` and still **outranks** the block — themes are deep-merged over the base, so a theme written before this release would otherwise inherit our numbers and lose its own. Delete that key to opt in; it goes in 12.0.

Two rules change for everyone, both fixing something that was already wrong:

- **The hosts get `display: inline-flex`.** They had no display at all, so the flex `<label>` inside made `<uni-checkbox>` and `<uni-toggle>` generate block boxes and fill their container — which is why a hidden-label checkbox could not be sized by measuring it, and why an app wanting one had to add `display: inline-flex` itself. A checkbox that was relying on that stretch now shrink-wraps; `fullWidth` is the way back.
- **The box and the track get `flex-shrink: 0`**, which `uni-radio`'s circle already had. Without it a long label in a narrow column squashed the box into a rectangle. Projected content makes that far likelier, so it ships alongside.

`labelHidden` and `fullWidth` take `booleanAttribute`, as `uni-inline-button` and `uni-expand-area` already do, so `<uni-checkbox labelHidden>` reads as true rather than binding the falsy empty string.

**Every other `fullWidth` gets the same transform**, because they all had the same defect: `<button text-button fullWidth>` was silently inert, and so were the bare forms on `uni-input`, `uni-input-box`, `uni-select`, `uni-textarea` and `box-layout` — the last of which also covers `fullHeight`. Property bindings (`[fullWidth]="true"`) always worked and are unaffected; `box-layout`'s two inputs now read `boolean` rather than `boolean | undefined`, which narrows a read type without changing a rendered rule.

The four field components forward `fullWidth` into `box-layout`, whose transform coerced the empty string at the end of the chain — so their bare attribute *appeared* to work while each component's own `fullWidth()` held `''`. That is why the guard for this asserts the input's value rather than the emitted CSS: a CSS-only assertion passes with the transform removed from any of the four.

`pnpm docs:api` learned to read those transforms: `llms.txt` was printing `labelHidden: unknown = false, { transform: booleanAttribute }`, and the same leak had been mangling the existing `link`, `disable`, `initCollapsed` and every aliased input. They now report the type they accept and the default alone.
