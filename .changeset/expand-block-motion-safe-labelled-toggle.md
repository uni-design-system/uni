---
'@uni-design-system/uni-angular': minor
---

Centre `icon-button`'s glyph, fix `expand-toggle`'s rotation, make `expand`
block-level and motion-safe, and give `expand-toggle` a label

Gaps found while building collapsible sections in a consuming app, where each
one had to be worked around locally.

- **`icon-button` centres its glyph.** Sizing `iconName` from the size token
  (shipped in the previous release) made the glyph smaller than the button —
  an `sm` button is a 22px box around an 18px icon — but the button was
  `display: block`, so the glyph sat in the top-left corner with all the slack
  on its right and bottom. It is now a centring flex box; flex is still
  block-level, so the button's own layout is unchanged, and the
  absolutely-positioned accessible-name span stays out of the flex flow.
  **Visual change** for every `icon-button`: glyphs shift to the middle of the
  box. `symbolName` ligatures centre too, which also means the known
  oversized-ligature case (a 24px glyph in a 22px `sm` box) now clips evenly on
  all sides instead of only bottom-right. Covered by a test.

- **`expand-toggle` rotates the glyph instead of its host.** This is a fix to
  existing behaviour, visible in 7.1.0 and earlier: the 180° turn was applied to
  the component host, which is both the tooltip's positioning box (`uni-tooltip`
  sets `anchor-name` on its own element, nested inside the host) and taller than
  the glyph, since an inline-level box reserves baseline descender space. So the
  bubble bobbed along an arc as the chevron turned, and the chevron itself
  drifted off-centre rather than spinning in place. The transform now lands on
  `uni-icon` — a centred square sized to the glyph, and the only box here that
  rotates symmetrically. The host keeps its `toggled` attribute, so any consumer
  styling keyed on it still works.

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
