---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

New `uni-breadcrumb` component

- WAI-ARIA breadcrumb: labelled `nav` landmark wrapping an ordered list, the last item
  marked `aria-current="page"`, separators decorative (`aria-hidden`).
- Data-driven `items` (root first). Items with `href` render as real anchors; without
  one they render as link-styled buttons emitting `itemClicked` for SPA routing.
- Token-driven via `breadcrumb.options`: `typeface`, link `color`, `currentColor`,
  `separatorSymbol` (material symbol), and `gap` spacing.
