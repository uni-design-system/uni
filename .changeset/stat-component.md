---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

New `uni-stat` KPI tile

- Muted label + large headline value (numbers auto-compact via
  `Intl.NumberFormat`: `48234` → "48.2K") set in a new `stat` type-scale role
  (32px semibold, proportional figures).
- Optional signed `delta` whose ink is decided by direction × `upIsGood` — churn
  going down reads green, tickets going up reads red — with the arrow glyph
  accompanied by screen-reader "up"/"down" text so state never rides color alone;
  `caption` names the comparison period.
- Optional decorative 12-point sparkline (`trend` input): stroke in the outline hue,
  endpoint dotted in the accent, `aria-hidden`.
- Fully token-driven via `stat.options`: card-recipe frame (`color`/`border`/
  `borderRadius`), `labelTypeface`/`valueTypeface`, `positiveColor`/`negativeColor`
  (the semantic inks, AA-guaranteed on surface), `trendColor`/`trendAccent`, spacing.
