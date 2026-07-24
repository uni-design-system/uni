---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-mcp': minor
---

Fix invisible icons; icons become first-class theme primitives

- **Bug**: `uni-icon` resolves icons from `theme.icons`, but every theme shipped
  `icons: {}` — the icon record was never wired in, so all icons (dialog close, button
  spinner, search/clear affordances) rendered nothing.
- **Fix + pattern**: the default icon set now lives in core (`BaseIcons`, in
  `concepts/iconography`) and `createTheme` merges a theme's `icons` over it — themes
  can override or add icons under any name (inline SVG data URIs, masked with
  `currentColor` so they recolor with the theme). The angular `icons` record re-exports
  `BaseIcons` (deprecated).
- `uni-icon` also sets the standard `mask-image` (was webkit-only, so icons were
  invisible in Firefox regardless) and renders nothing for unknown names instead of a
  broken `url("undefined")`.
- The emitted `uni-theme.ts` gains an editable `icons` section, and the MCP's
  `generate-uni-theme` guidance instructs agents: never inline SVG in components —
  define an icon once in the theme's `icons` map and render it via `<uni-icon>`.
