---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Progress gauge derives from the palette instead of hardcoded pastels

The gauge's track colors were fixed pastel hexes (`#b3d4ea`, `#b3e7c2`, …) that ignored
the active theme entirely — secondary and success even shared the same green. Tracks now
use the role's `*-container` token (the palette's soft tint of that role) and arcs the
role base, so gauges follow any brand palette, in both light and dark modes.
