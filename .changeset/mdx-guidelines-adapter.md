---
'@uni-design-system/uni-mcp': minor
---

MDX guidelines adapter — authored docs now reach AI agents

- New build adapter parses each component's co-located `.mdx` docs page into the
  index's previously-empty `guidelines` field: the `## Overview` prose becomes
  `whenToUse`, and optional `## Do` / `## Don't` / `## Accessibility` bullet sections
  map to their fields — so guidelines are authored in the same file the Storybook
  sidebar shows, with JSX/import scaffolding stripped.
- 48 components gain guidelines immediately; `get-guidelines` and `uni://guidelines/*`
  now answer with real when-to-use guidance (including the canonical selector forms
  from the 6.0 unification).
- MDX↔component matching: shared basename first (`tabs.mdx` → `tabs.component.ts`),
  same-directory fallback for group docs.
