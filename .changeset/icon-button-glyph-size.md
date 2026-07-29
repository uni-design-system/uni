---
'@uni-design-system/uni-angular': minor
---

Size `icon-button`'s `iconName` glyph from its size token

`icon-button` rendered a `symbolName` ligature at a font size, but an `iconName`
mask with no size at all — and the base `iconButton` size tokens carry no
padding, so the icon filled the entire button box edge to edge. That made
`symbolName` → `iconName` a visual regression rather than a like-for-like swap,
which matters now that `uni-icon` is the preferred path (a mask paints on the
first frame, where a ligature waits on the variable font).

- `iconName` is now sized from the size token's `fontSize` — the same value that
  scales the rest of the control — so the glyph sits inside the button and grows
  with `size`. Concretely, `size="sm"` renders an 18px glyph in a 22px button
  instead of a 22px one.
- **Visual change** for existing `iconName` call sites: glyphs get slightly
  smaller and gain breathing room. Themes that size icon-buttons with padding
  (e.g. the Carbon example) set a matching `fontSize`, so they land on the same
  glyph size either way and are unaffected.
- Known gap, now covered by a test that documents rather than blesses it:
  `uni-symbol` takes its size from `opticalSize` (default 24) and ignores the
  button's size token, so a `sm` button renders a 24px ligature in a 22px box.
  Masked icons do not have that problem — one more reason to prefer `iconName`.
