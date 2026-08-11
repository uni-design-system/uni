---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': major
---

`uni-tag` v2: themable, opt-in removal, two style axes

v1 was a single hardcoded look with the palette welded into its template, an
unconditional remove button, and no theme entry — a filter chip, a status pill
and a recipient token all rendered identically. v2 makes the chip a real themed
component and the building block `uni-tag-input` composes.

**Breaking (uni-angular)**

- **`(close)` is now `(removed)`.** The old name shadowed the native `close`
  event and needed an eslint suppression to compile.
- **The remove button is opt-in** — set `[removable]="true"`. Previously every
  tag, including a plain category label, shipped a "Remove …" button into the
  accessibility tree.
- Codemod: rename `(close)` → `(removed)` and add `[removable]="true"` wherever
  a `(close)` handler exists.

**Fixed**

- **A falsy value can now be removed.** `handleClose` guarded with `if (v)`, so
  a tag keyed `''` or `0` silently could not be dismissed. Every defined value
  emits, and a tag with no value emits `undefined`.
- The remove control now sizes from the chip instead of the icon-button's own
  `sm` size — it was 22px inside a 24px chip, and taller than an `sm` chip
  entirely.

**New**

- **Two orthogonal style axes**: `variant` picks the colour role, `tone` picks
  the archetype (`soft` / `solid` / `outline`). Both resolve from the new `tag`
  theme entry, with tones as nested `&.tone-*` selectors inside each variant so
  a theme author restyles both axes in one place.
- **`'tag'` joins core's `ComponentName`**, with a `TagTone` type and a full
  theme entry (`options` for radius/typeface/gap/symbols, `variants` per colour
  role, `sizes` carrying geometry only).
- **`interactive`** turns the chip body into a `<button>` with `selected` mapped
  to `aria-pressed`, keeping the remove control a sibling — nesting them would
  be invalid HTML and would strand the inner control for keyboard users.
- **Lead slot**: `avatarSrc`, `avatarName` (initials fallback), `symbolName` and
  `dot` convenience inputs, plus a `[tag-lead]` slot for anything richer. Lead
  elements size from the chip height, and all are `aria-hidden` so the chip's
  text stays its accessible name.
- **`invalid`** sets `aria-invalid` and a dashed underline, so the state does
  not rely on colour alone (WCAG 1.4.1); `disabled`, `maxWidth` truncation with
  a `title`, and `removeLabel` for overriding the remove button's name.
- The component ships with 21 specs, having previously had none.
