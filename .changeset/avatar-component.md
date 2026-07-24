---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

New `uni-avatar` and `uni-avatar-group` components

- Graceful fallback chain: image → initials derived from `name` (first + last) →
  themed symbol. Accessible by default: `role="img"` + `aria-label` from the name,
  `aria-hidden` when purely decorative.
- Fully token-driven: variants color from the role's `*-container` tokens, sizes from
  the theme's `avatar` size records, corner radius from `options.borderRadius`
  (`max` = circles; a `sharp` theme gets square avatars), initials typeface from
  `options.typeface`, fallback symbol from `options.fallbackSymbol`.
- `uni-avatar-group` stacks avatars with a token-driven overlap (spacing token) and
  separator ring (`ringColor`/`ringWidth` options); `max` collapses the overflow into
  a themed "+N" chip that is itself a `uni-avatar` (verbatim `text` input).
