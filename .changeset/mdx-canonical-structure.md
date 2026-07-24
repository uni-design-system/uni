---
'@uni-design-system/uni-mcp': patch
'@uni-design-system/uni-angular': patch
---

Canonical MDX docs structure + theme-options docs block

- Component docs pages now follow one flow (documented in AGENTS.md): imports →
  Overview → Usage (the compact playground: story + source + knobs) → named
  variation examples → **Theme options** → Accessibility → Do/Don't. Property/API
  tables are retired — the playground's controls are the API reference.
- New `ThemeOptions` docs block renders a component's per-theme option tokens live
  from the active Storybook theme (with color swatches), distinguishing per-theme
  options from per-instance inputs.
- The 13 recent-era pages are converted; their Accessibility/Do/Don't sections flow
  into the MCP guidelines index (21 components now carry accessibility guidance).
