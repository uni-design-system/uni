---
'@uni-design-system/uni-angular': patch
---

`dialog[uni-dialog]` and `uni-drawer` (`mode="over"`) no longer close when a text selection ends on the backdrop.

Both decided "was this a backdrop click?" from the click's target alone. A `click` is dispatched to the nearest common ancestor of the press and the release, and the `::backdrop` belongs to the `<dialog>` — so pressing in a field, dragging to select its text, and releasing past the panel's edge produced a click whose target *was* the `<dialog>`. The surface closed and the form's unsaved input went with it; a drawer with `disableAutoClose` emitted `closeRequest` with `reason: 'backdrop'`.

A backdrop click now requires the press to have started on the `<dialog>` as well. The rule lives in one place, the new `BackdropDismiss` helper in the cdk, so the two surfaces cannot drift apart again. It compares against `currentTarget` rather than `nodeName`, so a nested `<dialog>` in projected content no longer counts as its parent's backdrop. Escape, tapping the scrim, and clicks inside the panel behave as before.

One consequence for tests: a synthetic `click()` on the dialog with no `pointerdown` before it no longer closes it. Dispatch `pointerdown` on the dialog first, as a real press does.
