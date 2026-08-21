---
'@uni-design-system/uni-core': minor
---

`'popover'`, `'callout'`, and `'tour'` join `ComponentName`, with base-theme entries. The popover defaults reproduce the previously hardcoded look (`primary-surface`, `quaternary` border, `xs` radius, `raised` shadow, `6px 12px` padding, 7px offset) plus the tooltip-mode options; the callout entry carries the scrim/spotlight geometry (`scrimColor`, `spotlightPadding`, `spotlightRadius`, `ringWidth` — the ring color is deliberately the `variant` role, not an option); the tour entry is just `progressStyle` and `footerGap`, since its skin is the callout's.
