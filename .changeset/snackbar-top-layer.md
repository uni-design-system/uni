---
'@uni-design-system/uni-angular': minor
---

`uni-snackbar` now renders in the browser's top layer, so it can no longer be
covered by a high `z-index` or clipped by an `overflow: hidden` or transformed
ancestor. It was the last overlay in the library still competing on stacking
order: a `<dialog>` opened with `.show()`, which is the *non-modal* form and
never enters the top layer, left it relying on `zIndex: Z_INDEX.dialog`. That
held only because apps mount the bar near the root — anywhere else, a
confirmation of what just happened could be silently buried.

The bar is now a `popover="manual"`. Manual rather than auto because a
snackbar must not light-dismiss: a click anywhere else on the page would tear
it away from someone still reading it. It is not `showModal()` either — that
would make the rest of the page inert to announce a transient message.

`role="status"`, the auto-close timer, its pause-on-hover and pause-on-focus
behaviour, the entry and exit animations, and the `[(show)]` / `open()` /
`close()` API are all unchanged.

The element behind the component changed from `<dialog>` to `<div>`: the bar
is never modal, and `<dialog>`'s `open` attribute would have been a second,
competing notion of "shown" alongside the popover's own state. Styles that
reach inside the component to target `uni-snackbar dialog` need updating —
`uni-snackbar [role="status"]` is the stable selector.
