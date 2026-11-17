# Response: the 11.12.0 batch — the tour's arrow and scrim, three fixes, and the color request

**For:** Wellsourced
**From:** Uni Design System dev team
**Re:** `uni-tour-arrow-flip-and-soft-spotlight-cr.md` (all three findings);
`uni-dialog-animationend-target-cr.md`; `uni-dialog-backdrop-vs-popover-cr.md`;
`uni-select-arrow-padding-cr.md`; `color-swatch-components-2026-10-22.md`
**Date:** 2026-11-17

---

## `uni-tour-arrow-flip-and-soft-spotlight-cr.md` — all three

**§1 — the arrow follows the panel.** Your first option, measured. The callout
compares the panel's box with the target's after render and draws the arrow
from where the panel landed: the other side after a block flip, the other
alignment after an inline one (`bottom-start` flipped inline is `bottom-end`,
and the arrow's cross-axis offset moves with it). It is measured on open, on
every tour step, and again on scroll, on resize and when either box changes
size. `uni-popover` and `uni-tooltip` shared the helper and the bug, and have
the same fix.

Your second option is not available: an `@position-try` rule may set insets,
margins, sizing and alignment, and nothing else — not a custom property.

Delete `tour-arrow.ts` and the effect that calls it.

**§2 — `spotlightFeather`.** As proposed: a `callout` theme option in px,
unset by default. Above zero it adds the inset shadow to the window in the
scrim's own paint, at `feather × 0.4` spread. It composes with `ringWidth`.

**§3 — `backdrop`.** A `callout` theme option naming a primitive from the
theme's `backdrops` scale. When set it replaces `scrimColor`: its `background`
is the window's shadow and the full cover's fill, and its `backdropFilter`
goes on the four strips and on the target-less cover — never on the cover
over the hole. The background has to be a plain color, since the spotlight
paints it as a shadow.

```ts
callout: { options: { backdrop: 'scrim', spotlightFeather: 10, ringWidth: 0, spotlightRadius: 'sm', spotlightPadding: 10 } }
```

Delete both tour rules from `styles.css` and the `scrimColor: veil` override.

## The three fixes — all as proposed

- **`uni-dialog-animationend-target-cr.md`**: the dialog acts only on an
  `animationend` whose target is the dialog. The same guard went onto the
  drawer, the tooltip, the alert and the snackbar. Remove `keepInside` and the
  three `(animationend)` bindings from `app-sheet-dialog`.
- **`uni-dialog-backdrop-vs-popover-cr.md`**: your `press` check, in
  `BackdropDismiss`, so the dialog and the modal drawer both have it. Delete
  `utils/dialog-backdrop-guard.ts`, its spec, and the call in `app.ts`.
- **`uni-select-arrow-padding-cr.md`**: `'&& select'`. Remove the rule from
  `styles.css`. The reserve is 24px, where your rule had 28.

## `color-swatch-components-2026-10-22.md` — two of three, and a different shape

We built the swatch and the sampler, and **declined the field**. The reasoning
matters more than the list, because it changes what the swap looks like.

**Why not `uni-color-field`.** It is a form for one industry's record. Its
inputs are named manufacturer, sheen and paint code; its rules — a sample
never fills the name, a recognizer reads what is on the chip, the three
strings are the specification — are product decisions of yours. In Uni they
would be frozen into a public API that no other consumer could use unchanged,
and that you could no longer change without a release of ours. It is to color
what an address form is to text inputs: worth having, and an application's to
own. Your `app-color-field` is already that, and it is built from `uni-input`
and `uni-select` without reaching into anything of ours, which is the library
doing its job.

For the same reason the swatch does not take your `ColorValue`. It takes
plain inputs and has no opinion about what a color is.

**`uni-color-swatch`**

```html
<uni-color-swatch
  face="tile"
  size="lg"
  [hex]="color.hex"
  [name]="color.name"
  [detail]="color.code + ' · ' + color.manufacturer"
  [caption]="provenanceWord(color)"
/>
```

- `hex`, `name`, `detail`, `caption` — your wrapper maps a `ColorValue` onto
  them in one place, and keeps `showCode`, `showManufacturer` and the
  provenance words, which are yours.
- The four faces and the four sizes (14 / 22 / 40 / 72px, in
  `colorSwatch.sizes`) are as you asked. `card` is text-free and fills its
  container at any size, named for a reader by name, detail and hue. The
  empty block is the surface with one hairline diagonal. The block prints as
  it shows.
- `hex` reads anything `normalizeHex` does, and paints nothing it cannot read.
- `colorSwatch.options.border` is a border _primitive_ (default `light`), not
  a `borderRole` color: that is how every Uni component takes a border.
- `dot` without an `ariaLabel` logs a dev-mode error and still renders, named
  by the derived description. It does not throw: a component that throws in
  change detection takes the page with it.

**`uni-eyedropper`** — as requested: the mean of a `(2r + 1)²` region, both
paths behind one label, `EyeDropper` detected, arrows / Shift / Enter /
Escape, the center re-read once the photograph lands, the result announced
through `nameHue`. Three notes: the arrow step is 1px (Shift 10), per the
request rather than the interim's 2; `sampled.point` is 0–1 fractions of the
image; and the output is `canceled`, as the interim already spelled it. Every
string is overridable through `labels`.

**uni-core** — `normalizeHex`, `nameHue` and `meanColor` are public and
framework-free, for your field, your registry and the extension's React side
panel alike. `nameHue` passes the hue rows of your
`color-codes.fixtures.json`.

**The swap**

- `app-color-swatch` becomes a thin wrapper over `uni-color-swatch` (the
  mapping above), or goes away where a call site can bind the four inputs.
- `app-eyedropper` → `uni-eyedropper`.
- `app-color-field` stays yours. It can drop its own sampler and swatch for
  ours, and import `normalizeHex` and `nameHue` from uni-core.
- `normalizeColorValue`, `isColorComplete` and the recognizer stay in
  `@wellsourced/types`, where the record they describe lives.

## Still open on your list

- Combobox `allowCustom` / `displayWith`, callout default faces — maintainer
  decisions, parked.
- **Color roles** (`theme-color-roles-2026-10-10.md`) and the **phone input**
  (`phone-input-2026-10-10.md`) are the next two builds, in that order.
