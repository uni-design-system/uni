---
'@uni-design-system/uni-core': minor
---

Add `funnel` and `building` icons

Two gaps found while migrating a real app off inline SVG — both cases where the
existing set forced the app to keep hand-drawn artwork.

- **`funnel`** (`filter_alt`) — `filter` is `filter_list`, the stacked-lines
  metaphor. Apps that name the feature itself a funnel ("Funnel Analytics") draw
  the shape, and substituting stacked lines loses the reference.
- **`building`** (`apartment`) — pairs with `home` for residential-vs-commercial
  distinctions, which had no built-in counterpart.

Both are Material Symbols Outlined 300 on the shared `0 -960 960 960` grid, so
the set is now 61 icons. Note `building` carries more internal detail than most
of the set; it reads well from ~14px but goes muddy below ~12px, so prefer a
larger size or `home`'s simpler silhouette in very small badges.
