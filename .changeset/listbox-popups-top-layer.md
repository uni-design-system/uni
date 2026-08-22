---
'@uni-design-system/uni-angular': minor
---

The four listbox popups — `uni-search-input`, `uni-tag-input`,
`uni-time-input` and `uni-combobox` — now render in the browser's top layer,
anchored to their field, instead of as absolutely-positioned children of it.
Put any of them inside a card, a table cell, a scroll area or a dialog and the
suggestion list is no longer clipped by that ancestor's `overflow`. The browser
tracks the field natively, so the list follows on scroll and resize with no
listeners, and flips above the field near the bottom of the viewport.

They also open the way `uni-dropdown` does now — the same 100 ms scale-and-fade
— so every popup panel in the library animates alike instead of the listboxes
alone snapping into place. The origin is measured from where the popup actually
opened, so one that flips above its field near the bottom of the viewport still
grows out of the edge it is attached to. Under `prefers-reduced-motion` there is
no transition at all.

Nothing changes in the components' APIs or in how they dismiss. The popups use
`popover="manual"`, not `auto`: these controls already own dismissal through
focusout, Escape and commit, and `auto`'s light-dismiss fires on pointerdown
outside the popup — which includes their own input, so it would close the list
on every click into the field.

Positioning is gated on CSS anchor positioning support, checked together with
the top layer rather than separately. Browsers that have `popover` but not
anchors — Safari 17 through 25 — keep the previous in-flow popup, which still
clips inside `overflow: hidden` ancestors but stays on its field; promoting it
there would strand the list a viewport height down the page, since a top-layer
element has no positioned ancestor to resolve against.

Shared plumbing lives in `components/forms/listbox-popup.ts` alongside
`listboxPopupStyles()`, which grew an optional `anchor` and now emits the
in-flow rules as the base with the anchored ones in an `@supports` block.
