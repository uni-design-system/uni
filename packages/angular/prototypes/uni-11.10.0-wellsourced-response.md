# Response: the 11.10.0 batch — card states, the card group, and the rich-head follow-ups

**For:** Wellsourced
**From:** Uni Design System dev team
**Re:** `card-theme-state-2026-10-09.md`; `dialog-rich-head-followups-2026-10-22.md`
**Date:** 2026-10-22

---

## `uni-card` — all three asks

**The frame is an Emotion class.** `[style]` is gone; the border, radius and
elevation are emitted as a class, under the merged theme style as before, so
a theme rule can finally outrank them. One consequence, stated rather than
discovered: a consumer stylesheet that was silently losing to the inline
frame will start winning. We found none in your app.

**`selected` and `interactive`** add `card-selected` and `card-interactive`
to the frame — the contract `uni-tag` has had since 11.1, so a variant's own
`&.card-selected` rule reaches a card the way it reaches a chip. For the
common case the `card` entry gains options rather than making you write the
rule: `selectedBorder` (default `primary`), `selectedColor` (default
`primary-container`), `selectedElevation`, `hoverColor`, `focusRingColor`.
Your pick-one look — `light` frame and `tertiary-surface` at rest, `primary`
frame, `surface` and a ring when picked — is `card.options.border: 'light'`,
`selectedBorder: 'primary'`, `selectedColor: 'surface'`, `selectedElevation`
pointing at your ring shadow, and a `fixed` fill. An interactive card emits
`activated` on click, Space or Enter, and leaves a click on a control inside
its content — a link, a button — to that control. `disabled` is read.

**`uni-card-group`**, your optional third ask, with the tag-group keyboard
model as you proposed. Three decisions, made on the recommendations we gave the
maintainer:

- *Single-select*, as a `FormValueControl<T | null>` — it binds with
  `[formField]` like every other control, and both of your groups (kind of
  work, presentation template) are pick-one. `multiple` waits for a case.
- *The card is the option.* A `uni-card` with a `value` inside the group
  becomes the `role="radio"`; a card without one is content. No wrapper
  element, and the card's content is yours — title, description, icon, tag,
  anything — which is why the group projects cards rather than rendering them
  from an `options` array the way the tag group does.
- *APG radio keys*: one tab stop, the arrows move focus **and** select,
  wrapping at the ends; Home/End; Space or Enter selects. A disabled card is
  `aria-disabled` and skipped. The group is `role="radiogroup"` named by
  `ariaLabel` or `ariaLabelledBy`, with `aria-required` and an `aria-invalid`
  gated on touched or dirty, touched once focus leaves the group.

Laid out as a grid: `templateColumns` and `gap` per instance, defaults in the
new `cardGroup` theme entry (`repeat(auto-fit, minmax(160px, 1fr))`, `md`).
Your `card-select` — the 566 lines, the slots directive, the spec — reduces
to a `uni-card-group` with a `uni-card` per option and your own content in it.
The `label`/`hint` chrome above and below the grid is the app's field wrapper,
as it is for every other control.

## `dialog-rich-head-followups-2026-10-22.md` — all three

**§1 — `[dialog-title]` through a wrapper.** The header now finds the marked
title in the DOM after every render, so a title projected *through*
`app-sheet-dialog`'s template — invisible to a content query, and unable to
inject the dialog — names the dialog alone. And when there is no marked title,
the header defers to the dialog's own `ariaLabel`: the block names a bare
dialog only. Your diagnosis was exactly right and both of your options are in;
one more thing we fixed on the way is that the directive used to *replace* a
consumer's id on the marked element with the dialog's — it now keeps yours and
points `aria-labelledby` at it.

**§2 — the X.** Both shapes of the header read the dialog's
`defaultCloseButton`, as the drawer header reads the drawer's. Nine of your
sheets say `[defaultCloseButton]="false"` once and get no X.

**§3 — `alignItems`.** On both footer options, default `center`. Your
`[fullHeight]` row around the note can go, and with it the always-filled cell
that defeated the `&:empty` collapse.

## What is still open

1. Tour target resolver and lazy retry, `targetMissing`
   (`tour-and-callout-2026-10-14.md` §2).
2. Color roles (`theme-color-roles-2026-10-10.md`), then the phone input.

Parked decisions: combobox `allowCustom` / `displayWith`; callout default
faces; data-table §2 templated-cell padding.

## Verification

1,305 tests, 28 new across the card, the group and the dialog header. Lint,
type-check and the build are green; `llms.txt` is regenerated. In Storybook,
in Chrome: the group holds one tab stop, the arrows move and select, the
selected card wears the `primary` frame, a click on a control inside a card's
content leaves the selection alone, and the rich head is named by its marked
headline.
