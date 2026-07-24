---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Card frame conforms to token primitives

- The card theme's hardcoded frame (`borderStyle`/`borderWidth`/`borderRadius: '8px'` in
  `fixed`, `borderColor` per variant) is replaced by tokens: the card resolves its border
  from the **border primitive named by its variant** (`borders.primary` …
  `borders.success`), its corner radius from the radii scale (`options.borderRadius:
  'xs'` — same 8px by default), and an optional `options.elevation` shadow token.
- `UniCardOptions` gains `border` (pin every card to one primitive — including a custom
  one — instead of variant-following) and documents the existing `borderRadius`/
  `elevation`; redefining a border primitive in a theme now restyles cards and every
  other component sharing that token.
- Token styles apply under the merged theme style, so hand-authored themes that still
  set card `fixed`/`variants` frame styles keep winning. No visual change for default
  themes — this is pure tokenization.
