# Response: the 11.7.0 batch — tiers 1 and 2 of the October queue

**For:** Wellsourced
**From:** Uni Design System dev team
**Re:** `STATUS-2026-10-09.md` and the documents it indexes
**Date:** 2026-10-22

Your status index ranked the open asks by app code retired. We re-ranked on
four axes — silent-wrong-state bugs first, then "the theme cannot reach it"
gaps that already have a house pattern, then composition gaps by payoff, then
new capability — and the two orderings agreed at the top. This release is the
first two tiers: eleven documents touched, every change additive, every default
reproducing what the component previously hardcoded. The composition work
(footer slots, the non-modal drawer, data-table selection, card state) and the
new capability (color roles, phone input, tour target resolution) are the next
releases, in that order.

Three of your premises were wrong in your favour, and one ask is declined as
unnecessary once its neighbour landed. All four are below rather than quietly
folded in.

---

## Tier 1 — correctness

### `select-empty-value-2026-10-09.md` — fixed, and `null` had the same bug

A hidden "nothing selected" `<option>` is rendered whenever the model holds no
option — `''`, a stale id, **or `null` with no `placeholder`**, which you did
not report but had the identical failure: a native `<select>` with no selected
option shows its first entry, placeholder or not. With a placeholder the row is
the placeholder, as before; without one it is `hidden`, so the dropdown list is
unchanged. A dev-mode `console.warn` names a bound value that matches no option,
once per value, and only once the options are non-empty — a value ahead of its
options is the normal loading order and the field self-heals when they arrive.

The contract is now written on the page: `null` is "nothing selected"; a value
outside `options` renders as empty, never as the first option. Your
`app-form-field` can stop forcing a placeholder onto every select.

### `button-disabled-binding-2026-10-09.md` — fixed; the warning is not needed

`disabled` is an input on both buttons, aliasing `disable`. The binding that
used to land on the DOM property — where `disable() || loading() || null`
wrote `null` on the first pass and removed it — now lands on the input, so a
button that must start disabled starts disabled. `icon-button`'s `disable` and
`loading` take `booleanAttribute`, as `text-button`'s have since 11.2.0:
`<button icon-button disable>` works, and `[disable]="x()?.saving"` type-checks
without the `!!` — the transform accepts `unknown`. Your ten coercions and the
sweep script can go.

Your third ask, a dev warning for a `disabled` attribute the component did not
write, is declined: with the alias there is no such attribute to warn about.

### `tour-and-callout-2026-10-14.md` §1, §3, §5, §7 — fixed; §2, §4, §6 are next

- **§1** — both halves. `started` now fires when the first step of a run is
  *presented*, not when `start()` is called; `finished` is never emitted for a
  run that presented nothing (a dev warning says so). And a `start()` that finds
  no steps waits for them: your `afterRenderEffect` deferral and the
  "ignore a finished without a presented step" guard in the controller are both
  unnecessary now.
- **§5** — a write to `active` from `null` emits `started`, once. Your
  `viewChild` + `start(at)` detour can go back to the model.
- **§3** — a one-step tour renders no progress, whatever the theme says;
  `progressStyle` also accepts `'none'`, and has a per-instance input so a
  pointer can differ from a tour without a second theme entry (your §7 ask).
  The `:has(> i:only-child)` rule in `styles.css` can go.
- **§7** — `body` is optional; a title-only step renders no `<p>`.
- **§2** (lazy target resolution, a resolver function, `targetMissing`) and
  **§6** (the callout under a modal drawer) are Tier 3 and ride with the
  non-modal drawer. **§4** (callout default faces) is a decision about moving
  existing themes, not an effort question; it is parked with that note.

### `notification-badge-2026-10-09.md` — all four, with one number changed

The host is `inline-flex; align-items: center`. The `typeface` option is read
(you were right: declared, never wired). A `sizes` block drives the disc, keyed
by the inherited `size` input, and the count's `max-width` is gone — a count
widens into a pill rather than clipping "99+" inside a fixed square. `offset`
is documented as scaling with what is wrapped, with your -4 as the example.

The number: you proposed `sm` 14–16 / `md` 20 / `lg` 24. We shipped
**`sm` 14 / `md` 16 / `lg` 20**, because `lg` is `BaseComponent`'s default and
had to reproduce the 20px every badge already draws. Your nav badge is
`<uni-notification-badge size="sm">`; your `::ng-deep` indicator rules, the
`line-height: 1` (now the component's own, inside the disc) and the `overline`
retype in the theme can go — point `notificationBadge.options.typeface` at your
working sans instead.

### `uni-contact-input-followups-cr.md` — all three

- **§1** — both of your options, which turned out to be one. `parse` is
  forwarded, *and* the email preset splits a paste on whitespace. The wrinkle
  you did not have to find: a blanket whitespace split breaks
  `Ada Lovelace <ada@x.com>`, so the tokenizer walks words and keeps a run of
  non-address words with the `<address>` that closes it. Your spreadsheet
  column, a mail client's `Name <addr>, Name <addr>` and a mix of the two all
  commit correctly.
- **§2** — `chipAvatar`, as a `contactInput` theme option (default `true`) and
  a per-field input that overrides it. The chip-`title` half is not done:
  `uni-tag` has no `title` input, and adding one is its own small ask.
- **§3** — fixed in `uni-tag-input`, so every `openOnFocus` field gets it. The
  list's open state was already gated on "something to show", so the fix is
  that a focus *always* registers the request: suggestions that arrive later
  open it, and an Escape in between — which clears the request — keeps it shut.
  Your `share-composer` focus deferral can go.

### `field-chrome-options-2026-10-09.md` §4 — fixed

The toggle's hidden input is on the shared `visuallyHidden` recipe. You had it
right: it was the last one.

---

## Tier 2 — the theme reaches it

### `expand-toggle-text-role-2026-10-09.md` — fixed, on the `expand` entry

`textRole` / `textColor` and `sublabelRole` / `sublabelColor`, defaulting to the
`label` / `caption` / `on-background-variant` the template hardcoded, read
exactly as `uni-checkbox` reads its pair. They live on `expand` rather than a
new `expandToggle` entry because the trigger already reads that entry for its
clock, and the two must not drift. For your theme:

```ts
expand: { options: { textRole: 'body-2-long', sublabelRole: 'caption' } },
```

### `field-chrome-options-2026-10-09.md` §1, §3 — fixed; §2 corrected

- **§1** — `unframed` on `uni-input`, `uni-textarea` and `uni-number-input`,
  with the same meaning as on `uni-tag-input`: border, fill, radius, shadow,
  leading inset and the focus treatment all go; `aria-invalid` stays. It lives on
  `uni-input-box` and is forwarded, so your Subject row is
  `<uni-input unframed>` and `share-composer.css` loses its five-selector rule
  and its `ViewEncapsulation.None`.
- **§3** — `align` on `uni-input`, the same `'start' | 'center' | 'end'` as the
  number input. The `::ng-deep input` in `confirm-dialog.css` can go.
- **§2 — `labelHidden` on the text fields is not applicable.** None of them
  draws its `label`: it is bound to `aria-label` on the native control and
  nothing else, in 11.6.0 as in every earlier release. The `::ng-deep label` in
  `money-dialog.css` is clipping a `<label>` your own `app-form-field` wrapper
  renders — there is no Uni label under it to hide. That rule stays yours, or
  the wrapper grows a `labelHidden` of its own.

### `uni-dialog-pinned-regions-cr.md` §1d, §2 — fixed; §3, §4 are next

- **§1d** — `overscroll` on `UniDialogOptions`: `auto` / `contain` / `none`,
  default `contain` (what the body hardcoded). Set `none` and
  `app-sheet-dialog` stops re-setting it.
- **§2** — both shapes. `maxHeight` lets `uni-scroll-area` grow with its
  content up to a cap and then scroll; `fill` takes the room a flex-column parent
  leaves. In either mode the host becomes a flex column and the viewport its one
  shrinkable item — a `height: 100%` viewport cannot resolve against a
  max-height, which is why it never scrolled before. `partner-document-dialog`'s
  sticky recipe can be a `[dialog-body]`-shaped `<div scroll-area fill>`.
- **§3** (`closeOnConfirm`, `loading`, a footnote slot) and **§4** (a rich
  head) ship with `drawer-buttons-slot-2026-10-09.md` in the next release, so
  the dialog and the drawer move together.

### `combobox-value-contract-2026-10-09.md` §1 — fixed; §2, §3 need a decision

`emptyValue` is what a clear writes — the ✕ and an emptied field on blur
both — and a value equal to it reads as nothing selected: no ✕, no committed
option. `null` by default, so nothing moves; `emptyValue="''"` for your string
fields, and the `?? ''` reads and the two save-path guards can go.

`allowCustom` and `displayWith` were both declined by design when the combobox
shipped, pending a real consumer case. Your five files of create-row plumbing
are that case; it is a maintainer decision to reverse, not an effort question,
and it is queued as one.

---

## What is still open from your index, in order

1. Footer slots on `[dialog-buttons]` / `[drawer-buttons]`, `closeOnConfirm`,
   `loading`, a footnote slot, and a rich dialog head — with the **non-modal
   `over` drawer**, since both touch the drawer and the latter has no workaround.
2. Data-table selection column, `rowId`, the `expanded` model,
   `selectableWhen` / `expandableWhen`. The pending data-table refinements
   (`.changeset/data-table-cr.md`) ship in this release ahead of them.
3. `uni-card` as an Emotion class with `selected` / `interactive` states; the
   group is a scope decision.
4. Tour target resolver and lazy retry; the callout under a modal drawer.
5. Color roles (export the builder, type the keys, CSS variables), then the
   phone input.

Decisions parked for the maintainer: combobox `allowCustom` / `displayWith`;
callout default faces; the card group's scope; data-table §2 (templated-cell
padding, still deferred by choice).

## Verification

1,218 tests, 55 of them new across eleven components, each written to fail on
revert of its fix. Lint, type-check and the ng-packagr build are green;
`llms.txt` is regenerated. Layout changes (the badge host, the scroll area's
flex mode, the unframed fields) were checked in Storybook as well as in jsdom.
