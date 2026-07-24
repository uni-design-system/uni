---
'@uni-design-system/uni-mcp': patch
'@uni-design-system/uni-angular': patch
---

Canonical MDX docs structure across the entire library

- Component docs pages now follow one flow (spec in AGENTS.md): imports → Overview →
  Usage (the compact playground: story + source + knobs) → named variation examples →
  **Theme options** → Accessibility → Do/Don't. Property/API/Methods/Events tables are
  retired — the playground's controls are the API reference.
- New `ThemeOptions` docs block renders a component's per-theme option tokens live from
  the active Storybook theme (with color swatches), distinguishing per-theme options
  from per-instance inputs; data-table's raw `ThemeDataBlock` dump is replaced.
- All ~55 component pages conform: the 7 form-control pages (200–390 lines of legacy
  API tables) rewritten; empty Overviews authored (card, tag, icon-button, scroll-area,
  expand-area, data-table); accessibility bullets added across navigation, feedback,
  and form components.
- The MCP index now carries when-to-use guidance for 55 of 70 components (was 41) and
  accessibility guidance for 36 (was 21) — the remainder are subcomponents documented
  on their parent pages and internal directives.
