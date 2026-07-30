---
'@uni-design-system/uni-angular': minor
---

Make `expand` block-level and motion-safe, and give `expand-toggle` a label

Three gaps found while building collapsible sections in a consuming app, where
each one had to be worked around locally.

- **`uni-expand` is now `display: block`.** As a custom element it defaulted to
  `display: inline`, so its animated grid laid out as a block-in-inline box and
  the revealed content's spacing came out subtly wrong. Every consumer was
  writing `uni-expand { display: block }` by hand. **Visual change** for anyone
  who was relying on the inline default or already shipping that override — the
  override is now redundant and can be deleted.
- **The reveal respects `prefers-reduced-motion`** (WCAG 2.3.3). The
  expand/collapse keyframes ran unconditionally; they're now wrapped in
  `motionSafe`, as is `expand-toggle`'s chevron rotation. Under reduced motion
  the region appears and disappears instantly. `overflow: hidden` moved inside
  the guard deliberately: it exists to clip the box mid-animation, and leaving
  it applied at rest would crop decorations that legitimately paint outside the
  region (focus rings, offset outlines). Angular removes a leaving node on the
  next frame when it detects no animation, so nothing hangs.
- **`expand-toggle` takes `label` and `sublabel`.** It was chevron-only, so any
  disclosure that names its section — most of them — had to hand-roll the whole
  trigger row and its styles, which is how consumers end up with a private
  copy of this component. With `label` set the toggle renders a full-width row
  (chevron, label, muted qualifier) as a single button whose accessible name is
  the label, instead of an icon button sitting next to unrelated text. Only the
  chevron rotates, so the label stays upright. Omit `label` and the icon-only
  shape is unchanged, tooltip and all — `uni-expand-area` is unaffected.
