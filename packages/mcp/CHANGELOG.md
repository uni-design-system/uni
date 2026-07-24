# @uni-design-system/uni-mcp

## 4.3.0

### Minor Changes

- [`076202d`](https://github.com/uni-design-system/uni/commit/076202d367d6393df685fde5906671d1a34e5a1b) Thanks [@gaenglish](https://github.com/gaenglish)! - MDX guidelines adapter — authored docs now reach AI agents
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

### Patch Changes

- [`4bfb057`](https://github.com/uni-design-system/uni/commit/4bfb057c55651c0375e7f35dd6f804e8d5c69e88) Thanks [@gaenglish](https://github.com/gaenglish)! - Canonical MDX docs structure across the entire library
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

## 4.2.0

### Minor Changes

- [`fea0b2e`](https://github.com/uni-design-system/uni/commit/fea0b2e78da327f3acea144958af2d0dbbefb699) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix invisible icons; icons become first-class theme primitives
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

## 4.1.2

### Patch Changes

- [`ffb9692`](https://github.com/uni-design-system/uni/commit/ffb9692b6b6000a04f0ec3fd06b196818b5cf1c8) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix published index losing its Storybook examples, and keep the index in sync
  - `uni-mcp@4.1.x` shipped with **0 examples**: the package build regenerated the index in
    CI, where `storybook-static` (gitignored) doesn't exist, silently overwriting the
    committed 107-example index before bundling. `build` is now `tsup` only — the committed
    `uni-index.json` is the single source of truth and is bundled as-is.
  - The index is regenerated once per release instead: the changesets `version` step
    (`pnpm version-packages`) builds Storybook and reruns `build-index` after the version
    bump, so the refreshed index lands reviewably in the Version Packages PR.
  - `build-index` now fails loudly when it finds zero examples, so an example-less index
    can never ship silently again.
  - Index refreshed to v5.1.0: includes the new component option tokens
    (`button.behavior.borderRadius`/`typeface`, `card.behavior.borderRadius`), the nine
    Theme Builder presets' generation updates, and all 107 examples.

## 4.1.1

### Patch Changes

- [`f2951db`](https://github.com/uni-design-system/uni/commit/f2951db7f6267f29b56d127151ff843d445c40a4) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix `ng add` against real published packages (found by fresh `ng new` e2e):
  - The schematic bundle is CJS, but ng-packagr stamps `"type": "module"` into the
    published package.json, so Node loaded it as ESM and the CLI reported "no ng add
    actions". A nested `schematics/package.json` (`"type": "commonjs"`) scopes the
    bundle back to CJS.
  - The emitted `uni-theme.ts` used dot access on `Colors` (which has an index
    signature), failing under `ng new`'s strict `noPropertyAccessFromIndexSignature`.
    The emitter (and the MCP tool's guidance) now uses bracket access throughout.
  - `uni-angular`'s peer range on `uni-core` is now `workspace:^` (publishes as `^5.x`)
    instead of `workspace:*` (published as an exact pin). Alongside changesets'
    `onlyUpdatePeerDependentsWhenOutOfRange`, this stops minor releases from being
    inflated to majors by the peer-dependents rule — the cause of the 4.0.0 and 5.0.0
    version jumps.

## 4.1.0

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
