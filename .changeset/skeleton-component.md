---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

New `uni-skeleton` loading placeholder

- Three shapes: `text` (multi-line, ending on a short line like real copy), `rect`,
  and `circle`; explicit `width`/`height` accept CSS strings or px numbers.
- Painted with surface tokens (`skeleton.options`: `color`, `highlightColor`,
  `borderRadius`, `gap`) so placeholders sit naturally on light and dark themes; the
  shimmer sweep (`animation`/`duration` options) only runs when the user allows motion
  and degrades to static blocks under `prefers-reduced-motion`.
- `aria-hidden` — placeholders are invisible to assistive tech by design.
