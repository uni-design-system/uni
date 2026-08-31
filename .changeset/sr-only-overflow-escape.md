---
'@uni-design-system/uni-angular': patch
---

Visually hidden text no longer inflates a consuming app's scroll containers.

**Eighteen controls quietly added scrollable distance to whatever box happened
to be above them.** `visuallyHidden` was `position: absolute`, and the controls
that emit it — `uni-number-input`, `uni-quantity-stepper`, the toggle's hidden
`<input>`, and fifteen others — are `position: static`. An absolutely positioned
box resolves its containing block to the nearest *positioned* ancestor, so each
1x1 span skipped every `overflow: auto` between it and that ancestor and landed
in the distant ancestor's scrollable overflow. A consumer reported a fixed side
panel measuring `scrollHeight: 1891` against `clientHeight: 793` — the whole
1098px difference came from seven invisible spans that had escaped the panel's
body scroller.

The helper is now `position: fixed`, whose containing block is the viewport, so
it joins no ancestor's scrollable overflow at all. The element stays 1x1 and
clipped to nothing, so screen reader behaviour is unchanged. Inside a
`transform`ed ancestor a fixed box re-anchors to that ancestor, which is
harmless here: where the box lands never mattered, only what it overflowed.

This class of bug is invisible in isolation — it needs a consumer to nest the
control inside a scrolling shell before it appears — so it is now covered by a
test that renders the emitting controls and asserts what actually reaches the
DOM, not just the recipe.
