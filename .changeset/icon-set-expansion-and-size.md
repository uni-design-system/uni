---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-mcp': minor
---

Expand `BaseIcons` to 59 icons and add `uni-icon` sizing

The 34-icon set shipped in 7.0.0 covered the library's own components but not a
real application — an app migrating off inline `<svg>` (or off `uni-symbol`, in
Angular) ran out of names almost immediately. Everything here is additive; all
34 existing names are unchanged.

- **25 new icons**, same Material Symbols Outlined 300 source and the same
  `0 -960 960 960` grid as the rest of the set: navigation (`link`, `expand`,
  `gridView`, `listView`), actions (`moreHorizontal`, `copy`, `send`,
  `refresh`, `dragHandle`, `qrCode`), feedback (`star`, `verified`) and
  user/system (`group`, `shieldPerson`, `clock`, `mail`, `chat`, `image`,
  `document`, `payment`, `bank`, `trendingUp`, `extension`, `webhook`,
  `logout`).
  - `moreHorizontal` ships alongside `more` because that one is `more_vert` and
    row-aligned menus need the horizontal kebab.
  - `star` is separate from `favorite`, which is the heart.
- **`uni-icon` gains an optional `size` input** (`CssLength` — bare numbers are
  px, strings pass through, so `20` and `'1.25rem'` both work). Left unset,
  behaviour is unchanged: the icon fills its container, which is what lets a
  themed control size its own glyph through padding. Set, it applies
  width/height as inline styles, so an explicit size wins over the
  fill-the-container rule regardless of style injection order. This removes the
  per-call-site `width`/`height` CSS rule that replacing an inline `<svg>` with
  `<uni-icon>` would otherwise need.
- The MCP `create-icon-tokens` tool now lists the built-in icon names above the
  token map it returns. Apps routinely hand-draw their own `close`, `check` or
  `plus`; encoding those into theme tokens works but adds redundant artwork on a
  foreign grid when the theme already ships the glyph. The tool cannot recognise
  a shape, so it hands the caller the list to check against before adding
  anything.
