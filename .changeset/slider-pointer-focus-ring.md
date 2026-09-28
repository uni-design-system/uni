---
'@uni-design-system/uni-angular': patch
---

`uni-slider` no longer draws the keyboard focus ring when the thumb is grabbed with a pointer.

`pointerdown` focuses the thumb from script, before the browser's own mouse focus runs, so Chrome counted the focus as programmatic and matched `:focus-visible` — every grab drew the ring meant for keyboard users. The thumb now remembers that its focus came from a pointer and withholds the ring until a key is pressed or the thumb blurs, as native controls do. Tabbing to the thumb, and arrowing a thumb you just grabbed, still ring as before.
