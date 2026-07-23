# @uni-design-system/uni-angular

## 5.0.0

### Minor Changes

- [`f7f0bdd`](https://github.com/uni-design-system/uni/commit/f7f0bdddfac855955e022a852c2bfdccf8013a7b) Thanks [@gaenglish](https://github.com/gaenglish)! - OKLCH theme generation engine (`concepts/generation`)
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

### Patch Changes

- Updated dependencies [[`f7f0bdd`](https://github.com/uni-design-system/uni/commit/f7f0bdddfac855955e022a852c2bfdccf8013a7b)]:
  - @uni-design-system/uni-core@5.0.0

## 4.0.0

### Minor Changes

- [`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9) Thanks [@gaenglish](https://github.com/gaenglish)! - Porting Components

### Patch Changes

- Updated dependencies [[`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9)]:
  - @uni-design-system/uni-core@4.0.0

## 3.0.2

### Patch Changes

- [`dcaf166`](https://github.com/uni-design-system/uni/commit/dcaf1668fb94716b192c65137a14f3ea561a0142) Thanks [@gaenglish](https://github.com/gaenglish)! - Extending the Symbol component to support theme options.

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.2

## 3.0.1

### Patch Changes

- [`fabbb73`](https://github.com/uni-design-system/uni/commit/fabbb73e7b2124e14b3cc263b2b8ca43e0cf80bd) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting new components and formatting.

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.1

## 3.0.0

### Minor Changes

- [`54a945c`](https://github.com/uni-design-system/uni/commit/54a945c51635898acb0c8ec0dd93ee234c580228) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting Components, Themes, and CDK

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.0

## 2.0.4

### Patch Changes

- [`ad5dd15`](https://github.com/uni-design-system/uni/commit/ad5dd151d245765b9d24a6ad1370a3e9d0d6b63e) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting multiple Angular Components

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.4

## 2.0.3

### Patch Changes

- [`eb80cff`](https://github.com/uni-design-system/uni/commit/eb80cffaaba0009c1c30875f93ea7e75dcf92302) Thanks [@gaenglish](https://github.com/gaenglish)! - fix: setting dist directory in publishConfig

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.2

## 2.0.1

### Patch Changes

- [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4) Thanks [@gaenglish](https://github.com/gaenglish)! - Setting Fixed Versioning for all packages.

- Updated dependencies [[`e2cad74`](https://github.com/uni-design-system/uni/commit/e2cad74631b3a9d2caf4816bcadedf19db99fec4), [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4)]:
  - @uni-design-system/uni-core@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [[`4a049de`](https://github.com/uni-design-system/uni/commit/4a049def689d56d6b6cc1d2da73c9facd93ed515)]:
  - @uni-design-system/uni-core@1.1.0

## 1.0.0

### Major Changes

- [`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756) Thanks [@gaenglish](https://github.com/gaenglish)! - init release

### Patch Changes

- Updated dependencies [[`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756)]:
  - @uni-design-system/uni-core@1.0.0
