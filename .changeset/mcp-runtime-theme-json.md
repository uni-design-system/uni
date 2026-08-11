---
'@uni-design-system/uni-mcp': minor
---

Runtime theme JSON: `generate-runtime-theme`, `get-runtime-theme`, and a theme registry endpoint

`generate-uni-theme` returns `uni-theme.ts` **source** — codegen by design, and
the right answer for branding an app permanently. It is the wrong answer when a
theme needs to apply *now*: an agent had to write a file and rebuild. These tools
close that gap (ROADMAP Track 1 item 4).

- **`generate-runtime-theme`** — brand hex color(s) in, a WCAG-AA light+dark pair
  out as validated JSON, ready for `ThemeService.registerTheme(theme, { select:
  true })`. No file, no rebuild.
- **`get-runtime-theme`** — a theme that ships with Uni as a registerable
  `UniTheme`. Distinct from `get-theme-template`, which returns a flat read-only
  projection of token values rather than the theme object itself.
- **Both validate before returning.** Every theme is run through uni-core's
  `parseTheme`, so "validated" is checked rather than claimed; a failure comes
  back as a tool error listing every reason.
- **First tools with an MCP `outputSchema`**, so agents get a machine-readable
  contract instead of parsing prose (opens ROADMAP Track 1 item 6). The theme
  itself is typed as an opaque validated object on purpose — uni-core's
  `parseTheme` stays the single source of truth for theme shape, and a mirrored
  schema here would drift from it.
- **Payloads elide the built-in icon set** (`dehydrateTheme`), taking a
  light+dark result from ~100 KB to ~30 KB — roughly 7.6k tokens instead of 25k
  per call. Consumers restore them on registration.
- **New registry endpoint on the HTTP server**: `GET /themes` lists the ids and
  `GET /themes/{id}.json` returns one registerable theme, for apps that fetch a
  theme without speaking MCP. These routes are public, read-only and
  CORS-enabled so a browser can fetch them directly; `/mcp` stays token-guarded
  and same-origin.
- The server's instructions now carry a routing rule for the four theme tools
  (brand permanently / apply now / inspect values), and the README tool table
  lists `create-icon-tokens`, which shipped undocumented.
