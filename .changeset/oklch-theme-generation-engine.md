---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-mcp': minor
---

OKLCH theme generation engine (`concepts/generation`)

- New `generateThemes(input)` / `generateUniThemes(input)`: brand seed(s) in, complete
  WCAG-AA light+dark `Colors` pair out, with a machine-readable `ContrastReport`
  (110 checked pairs per theme pair). Pure and deterministic.
- All palette math moved from HSL to perceptual OKLCH: uniform lightness slots across
  hues, per-category chroma model (`CategoryChroma`), dark-mode accent chroma decoupling
  (C ≤ 0.16), and a contrast guard-rail that adjusts lightness only — never hue.
- Brand colors ride as soft `targets` (kept verbatim when already AA, lightness-adjusted
  when not) alongside the existing hard `brand` pins; accepted by `generatePalette`,
  `createThemeFromPalette`, and Angular's `BrandPaletteConfig`.
- Semantic inks re-tuned per role: error 27°/C 0.20, warn 55°/C 0.18 (rotated off amber —
  dark yellow reads brown), success 152°/C 0.16.
- `createTheme` accepts optional `radii`/`shadows` overrides; `ShapeRadii` presets
  (`sharp` / `modern` / `playful`) emitted via the `shape` generation input.
- Theme Builder ships nine curated AA-clean presets built on soft targets.
- Deprecated (thin wrappers/tables retained): `uniColor`, `randomRangeValue`,
  `CategorySaturation`, `CategoryLightness`. `schemeHues` moved to `color.utils`.
- `createTheme` deep-merges optional `borders` and `components` overrides over its
  derived defaults — themes can define custom named primitives and rewire per-component
  options without restating untouched sections.
- New `emitThemeFile()` renders a static `uni-theme.ts` — literal colors, visible border
  primitives, sparse component overrides — the editable source of truth; the engine
  never ships to the browser.
- New `ng add @uni-design-system/uni-angular` schematic: installs the peer set, writes
  the generated theme file, registers `UNI_THEMES` in `app.config.ts`, adds typeface
  links, scaffolds a themed smoke test, and prints the contrast summary.
- New MCP tool `generate-uni-theme`: returns the static theme file content, provider
  snippet, and contrast report, with agent guidance to edit the file for restyling.
- `uni-core` gains its first Vitest suite, including a 1,080-seed contrast property
  corpus with zero tolerance in both modes; the schematic gets its own spec suite.
