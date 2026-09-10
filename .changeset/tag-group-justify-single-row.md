---
'@uni-design-system/uni-angular': patch
---

Fix `uni-tag-group`'s `layout="justify"` doing nothing until the chips wrap.

Justification was implemented with a filler child that lands on the last row and swallows its slack, which is what leaves that row ragged. But a group that fits on one row is *all* last row, so `justify` had no visible effect at all until the chips overflowed — the common case for a filter row read as the feature being broken.

Whether the group has wrapped is now **measured** rather than assumed: a single row stretches flush, and the last row is left alone only once there is more than one. A `ResizeObserver` on the host drives it, so it stays right as the viewport changes — which a flag could not be, since the same group is one row on a desktop and three on a phone.

The measurement cannot chase its own tail: flex breaks lines from each item's basis *before* it grows anything, so neither the filler nor the growth this decision enables can move a chip to another row. The filler also now pulls back the gap in front of it, so its whole footprint is zero — on a row that happened to be exactly full, that gap alone was enough to push it onto a line of its own.
