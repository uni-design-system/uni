---
'@uni-design-system/uni-angular': patch
---

`uni-tabs` no longer pads its panel.

The panel carried a hardcoded `md` top padding, which assumed every consumer wanted that gap between the tablist and their content. Full-bleed content (a table, a divider, a tinted surface) could not sit flush against the tablist without a negative margin. The panel now adds no padding; content that relied on the gap should set its own spacing.
