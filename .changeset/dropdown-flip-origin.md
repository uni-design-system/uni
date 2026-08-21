---
'@uni-design-system/uni-angular': patch
---

`uni-dropdown` (and everything riding it — the date picker popup, menus, multi-select): the open/close scale animation now originates from the corner actually touching the trigger. The origin was mapped statically from the *requested* placement, but `position-try-fallbacks` lets the browser flip the panel at viewport edges — so a `bottom-end` date picker repositioned above its field still animated from the top-right corner. The panel is now measured on each toggle (open and close-start) and the transform origin follows the rendered position, via the new cdk helper `transformOriginFor(panelRect, triggerRect)`.
