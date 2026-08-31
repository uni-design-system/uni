---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

`uni-drawer` is a three-row panel, and is no longer its own scroll container.

**The `<dialog>` used to be the scroller.** `over` mode set `overflowY: 'auto'`
on the panel and put the theme's padding there too, which made a pinned header
or footer impossible: padding on a scrolling box scrolls away with its content,
and any row you pinned against it could not sit flush to the panel edge. It also
set only the one axis — and a single explicit overflow axis computes the other
to `auto`, which is exactly how a container becomes an accidental scroller.
`side` had it right already, setting both.

The panel is now a flex column of three rows — an optional
`[uni-drawer-header]`, the projected body, an optional `[uni-drawer-buttons]`
(alias `[drawer-buttons]`) — and **only the body scrolls**. The panel itself is
`overflow: clip` on both axes, explicitly, never the shorthand. The body carries
`overscroll-behavior: contain`, so scrolling to its end does not start scrolling
the page behind it, and `position: relative`, so a stray absolutely positioned
descendant is contained rather than re-homed into an ancestor.

Those two must travel together: a positioned body *without* a clipped shell is
worse than the status quo, because it pulls phantom overflow into the scroller
instead of out of the panel.

**`drawer.behavior.padding` is now the body's padding, not the panel's.** A
drawer with no header or footer looks the same as before. One that gains either
gets rows flush to the panel edge, which is the point.

Two new theme entries, `drawerHeader` and `drawerButtons`, mirror the dialog
pair knob for knob but default to a panel's posture rather than a dialog's: the
header's title is left-aligned rather than centered, and the footer trails its
actions rather than centering them.

Note one deliberate divergence from `[dialog-buttons]`: the drawer footer's
**confirm button does not close the drawer**. A panel's save is usually async
and can fail, so closing is left to the consumer via `(confirmed)`.
