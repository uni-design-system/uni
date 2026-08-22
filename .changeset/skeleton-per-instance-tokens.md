---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

`uni-skeleton` picks up the knobs an app theme could not reach. `color`, `highlightColor` and `borderRadius` are now inputs that take a token name and fall back to the theme option, because one screen routinely needs several of each — text bars and a pill chip do not share a corner (`borderRadius="max"`), and a skeleton on a card wants a different tint than one on the page background.

The shimmer is now a band swept with `transform` rather than an animated `background-position`: it composites instead of repainting every frame, and its geometry is themeable via two new options, `direction` (`'ltr' | 'rtl'`, default `'ltr'` — the sweep previously ran right-to-left) and `highlightWidth` (band width as a percentage of the block, default `40`). Both ends of the band are the base color, so it dissolves into the block with no alpha and no fringing.

A new `label` input announces a standalone skeleton: set it and the host becomes `role="status"` with visually hidden text instead of `aria-hidden="true"`. Unlabelled skeletons stay `aria-hidden`, so container-level `aria-busy` patterns are unchanged.
