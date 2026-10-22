# Response: the 11.8.0 batch — the dialog and the drawer

**For:** Wellsourced
**From:** Uni Design System dev team
**Re:** `uni-dialog-pinned-regions-cr.md` §3–§4, `drawer-buttons-slot-2026-10-09.md`, `drawer-non-modal-2026-10-10.md`, `tour-and-callout-2026-10-14.md` §6
**Date:** 2026-10-22

Tier 3's first item, as one release because all of it touches the same two
surfaces. Everything is additive; the title bar, the Cancel/Save pairs and the
modal drawer render as they did.

---

## Footer slots — `drawer-buttons-slot-2026-10-09.md`, dialog CR §3

Both footers take `<ng-content>`. Empty, each renders its pair as before;
project your own buttons and they replace the pair while keeping the row's
chrome — padding, gap, `justifyContent`, the divider, `stretch`, `reverseOrder`.
Your seven side-panel footers (a note plus two buttons, destructive-left /
Save-right, Keep / Use / Discard, a running total) all fit, and
`app-side-panel` and `app-sheet-dialog` can import the components they were
carrying the attribute of.

The three asks on the dialog pair, too: **`closeOnConfirm`** (default `true`)
off leaves the closing to you, so a failed save keeps the sheet open with its
error; **`loading`** puts the spinner on Confirm (and on the drawer's Save);
and a **`[dialog-footnote]`** / **`[drawer-footnote]`** projects on the leading
edge, pushing the actions to the trailing one — "The item opens for your
review." is one span.

On your §3 note that a dev warning for "the attribute without the import" is
impossible from our side: still true, so it is documented instead, on both
pages — the attribute is also the component; import it deliberately.

## The rich head — dialog CR §4

`rich` on `[dialog-header]` renders the projection as a block beside the close
button: your eyebrow, headline and blurb, left as you wrote them, with no
`uni-text` wrapper and no forced centre. Mark the headline **`[dialog-title]`**
and it alone becomes the dialog's accessible name; without one the whole block
is. Two theme options dress it — `richColor`, unset by default so the head is
part of the sheet rather than a pill on it, and `richPadding` (`md`), with
`paddingHorizontal` still outranking it sideways.

We took the projection-mode shape over a second `[dialog-head]` component: one
selector, one theme entry, and no "which header do I import" trap next to the
footer one you just reported.

Your second §4 bullet — the title bar's `'center'` fallback applying when the
theme leaves `textAlign` unset — is deliberately unchanged. Changing it would
move every custom theme that never set the option; the rich mode is where
left-aligned lives.

## The non-modal drawer — `drawer-non-modal-2026-10-10.md`

`[modal]="false"` on `over` mode, as you proposed: the panel is shown as a
`popover="manual"` instead of `showModal()`, so it keeps the top layer — no
ancestor stacking context or `overflow: hidden` can clip or cover it — and
drops the focus trap and the inert page. The Presentation Builder's preview is
live with the panel open, and a toast's Undo is clickable behind any panel on
it. Measured with `document.elementFromPoint` over the open panel: the page's
own button is the hit, not `DIALOG`.

The three consequences, specified the way you asked:

1. **No scrim.** `scrim` is ignored, with a dev-mode warning when it is set.
2. **Escape** still fires `closeRequest` with `reason: 'escape'` — a keydown
   listener on the panel, so only while focus is inside it — and
   `disableAutoClose` vetoes it exactly as in modal mode.
3. **Click-outside** is off by default: for the workbench, the canvas is the
   outside. `closeOnOutsideClick` opts in, with `reason: 'outside'` (a new
   member of `DrawerCloseReason`; a modal panel still reports `backdrop`).

`initialFocus` applies on open. Focus returns to the opener on close: a manual
popover does not do that natively — we measured focus landing on `<body>` —
so the drawer does it itself.

## The callout under a later panel — tour CR §6

Every tour step re-shows the callout's scrim and panel, in that order. A panel
opened by the previous step's click entered the top layer after them and
covered them; re-showing puts them back on top, so the next step can point
inside the panel. Verified: a `popover="manual"` element covering the callout
mid-tour is beneath it on the next step, and Next is clickable.

**One correction to the premise.** This fixes stacking; it cannot fix
inertness. A `showModal()` dialog makes every node outside its subtree inert,
and a popover re-shown above it is painted above it but still not
hit-testable — we measured that too. So a tour that steps into a drawer needs
the drawer to be non-modal, which is why the two shipped together. The Ask
dock can be a `[modal]="false"` drawer and run a tour beside an answer.

## What is still open, in order

1. Data-table selection column, `rowId`, `expanded` model, `selectableWhen` /
   `expandableWhen` (`data-table-selection-2026-10-10.md`).
2. `uni-card` as an Emotion class with `selected` / `interactive` states
   (`card-theme-state-2026-10-09.md`); the group is a scope decision.
3. Tour target resolver and lazy retry, `targetMissing`
   (`tour-and-callout-2026-10-14.md` §2); callout default faces (§4) is a
   decision.
4. Color roles, then the phone input.

## Verification

1,247 tests, 29 new across the two footers, the header, the drawer and the
callout, each written to fail on revert. Lint, type-check and the build are
green; `llms.txt` is regenerated. In Storybook, in Chrome: the non-modal panel
is `:popover-open` and not `:modal`, the page behind it takes clicks, Escape
inside it closes it and returns focus to the opener; the rich head is labelled
by its `<h2>`; the footnote sits on the leading edge with Confirm busy and the
dialog open through an async save; and the callout is above a popover opened
mid-tour.
