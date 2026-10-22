# Response: the 11.11.0 batch — tour targets, and the card-group follow-ups

**For:** Wellsourced
**From:** Uni Design System dev team
**Re:** `tour-and-callout-2026-10-14.md` §2; `card-group-followups-2026-10-22.md`
**Date:** 2026-10-22

---

## `tour-and-callout-2026-10-14.md` §2 — all three, plus the one you offered as an alternative

**Targets resolve when the step presents, in three shapes.** `UniTourStep.target`
is now `HTMLElement | string | (() => HTMLElement | null)`. A function is
called at present time, never earlier. A string is an id unless the tour's new
`resolveTarget` input says otherwise:

```html
<uni-tour [steps]="steps" [resolveTarget]="byToken" (targetMissing)="log($event)" />
```

```ts
byToken = (token: string) => document.querySelector<HTMLElement>(`[data-tour="${token}"]`);
```

With that one lookup your steps carry their `data-tour` tokens as strings and
the controller stops pre-resolving. An element you do hand in that is no
longer in the document — a re-rendered board — counts as missing rather than
anchoring the callout to nothing.

**A missing target is waited for.** When a step's target does not resolve, the
tour watches the document (a `MutationObserver` on `body`, child list,
subtree and attributes) for `targetTimeout` milliseconds — 2000 by default,
an input — and presents the step the moment the element lands. The previous
step stays up meanwhile, so a page landing in pieces does not flash the tour
closed and open. That is both of your first two consequences:

- the project page's header tabs land before the board, and the board's
  steps now open when it does — the controller's deadline `MutationObserver`
  can go;
- a click-gated step advances inside the click listener, before Angular has
  drawn what the click opened — the next step waits for the panel and opens
  inside it. The rule that every target of a tour has to be on the page at
  once is gone; the one that remains is that a panel the tour points into
  must be non-modal (`[modal]="false"` on `uni-drawer`, as the 11.8.0 answer
  said), since a modal's inertness is not something stacking undoes.

Only a target that never appears within the window is skipped, in the
direction of travel, with the dev warning as before. `targetTimeout="0"`
restores the instant skip.

**`targetMissing`** — `{ key, index }`, emitted whenever a step is skipped for
want of a target, before the tour moves on. ASK-035's log line is a handler
on it. Note that a run in which *every* step is missing still emits it per
step and still never emits `finished`, as 11.7.0 set.

## `card-group-followups-2026-10-22.md` — both

**§1 — keys inside a card's content are the content's.** The group now acts
on an arrow, Home or End only when `event.target` is a card's frame — the
`role="radio"` element — the same guard the card's own Space and Enter have.
A caret moving in the address field on a ship-to card moves the caret; the
`stopPropagation` wrapper in `app-card-option` can go. The check is by
identity against the registered cards' frames, not by a selector of control
elements, so a `[contenteditable]`, a nested listbox or anything else inside
the content is covered without a list to maintain. `UniCardOption` gains
`frame()` for it; the card implements it, a consumer never calls it.

**§2 — an option card fills its cell.** A `uni-card` that is an option in a
group sets `display: grid` on its own host (an Emotion class the component
owns), so the one frame child takes the cell's height and two cards in a row
share a frame height whatever their descriptions. A card outside a group, or
a valueless card inside one, is untouched — the host still has no display of
its own, as before. Delete the `uni-card-group > uni-card` rule in
`styles.css`.

## Still open on your list

- **§4 callout default faces** — a maintainer decision, parked; your theme
  override is the right workaround meanwhile.
- **Color roles** (`theme-color-roles-2026-10-10.md`) and the **phone input**
  (`phone-input-2026-10-10.md`) are the next two builds, in that order.
