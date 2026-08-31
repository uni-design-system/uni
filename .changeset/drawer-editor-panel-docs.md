---
'@uni-design-system/uni-angular': patch
---

Document the drawer as an editor panel, and assert the layout that makes it one.

Both existing Drawer stories were navigation shells, so the shape that actually
stresses the component — a pinned header, a long scrolling form, a pinned save
bar — had no worked example. `EditorPanel` is that example, with a
`uni-number-input` and a `uni-quantity-stepper` near the bottom of the scroll,
where the sr-only overflow bug used to surface.

It carries a play function that asserts the scroll geometry: the panel's
`scrollHeight` equals its `clientHeight`, setting `scrollTop` on it does
nothing, the footer has no scrollable content of its own, the body scrolls to
its last element and stops, and no descendant has escaped its scroll container
to land on the panel. Those assertions live in the story rather than the unit
spec on purpose — jsdom has no layout engine, so every one of them would pass
vacuously there.

The MDX gains the three-row layout, the close-request contract, an input table,
and theme-option blocks for the two new component entries.
