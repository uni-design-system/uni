---
'@uni-design-system/uni-core': minor
---

Theme validation contract: `parseTheme` / `assertTheme` / `isUniTheme`

Every theme scale is `Partial<Record<…>>`, so a malformed theme — hand
written, generated, or fetched as JSON — rendered as silent `undefined` CSS
with no diagnosis. Core now ships a **dependency-free** structural validator
(core stays zero-dep; no zod outside the MCP):

- **`parseTheme(input): ThemeParseResult`** collects every issue rather than
  failing fast: `{ success, theme?, issues: [{ path, message }] }` with dotted
  paths like `colors.primary` or `typography.label.fontSize`. Acceptance /
  rejection **with reasons** is the API.
- **`assertTheme(input)`** throws with all reasons; **`isUniTheme`** is the
  type-guard form; **`formatThemeIssues`** renders issues for logs.
- The contract requires what components can't render without: 16
  `REQUIRED_COLOR_TOKENS`, all 22 canonical `REQUIRED_TEXT_ROLES` (with
  `fontFamily`/`fontSize`/`lineHeight`), the spacing/radii/shadow/thickness
  scale keys, and recursively-valid component style expressions. All
  `REQUIRED_*` sets are exported for tooling (MCP, docs, registries). Themes
  remain free to add arbitrary named primitives on every scale.
- Because a `UniTheme` is plain serializable data, the same contract
  validates JSON round-trips — the foundation for theme distribution and
  runtime theme registries (ROADMAP Track 1).
