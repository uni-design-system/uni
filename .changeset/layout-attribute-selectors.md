---
'@uni-design-system/uni-angular': major
---

Layout components are attribute-only, on any element

**Breaking:** the shorthand element selectors `Box`, `Stack`, `Row`, `Grid`, `Wrap`,
and `GridArea` are removed — a concept inherited from another library that conflicted
with semantic HTML. Migrate to the attribute form: `<Box padding="md">` →
`<div box-layout padding="md">` (GridArea → `grid-area-layout`).

In exchange, the attribute selectors now apply to **any element**, not just `div` —
layout and semantics compose: `<main box-layout [grow]="1" padding="md">`,
`<nav stack-layout gap="sm">`, `<section stack-layout>`.

Also documented, unchanged in behavior: the sizing convention (number = px via
binding, `[height]="420"`; plain attribute = CSS length, `height="420px"`) and
Stack/Row's `fit-content` min-size defaults (set `[minHeight]="0"` / `[minWidth]="0"`
for scroll containment). All internal usages, stories, and docs are migrated —
including the Divider story's `<Center>`, which had silently never rendered (Center
never had an element selector).
