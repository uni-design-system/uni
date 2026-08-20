# @uni-design-system/uni-mcp

## 4.7.0

### Minor Changes

- [`e706e38`](https://github.com/uni-design-system/uni/commit/e706e3887f47d8821cc1652410ad37a43d52a428) Thanks [@gaenglish](https://github.com/gaenglish)! - `get-changelog`: release notes as a first-class MCP tool, plus a `uni://changelog/{package}` resource.

  The index now ingests every published package's changesets `CHANGELOG.md` (a new build adapter parses them into structured releases — bump level, headline, full body, commit, dependency bumps). The tool answers "what changed in X?" and "what do I get by upgrading?": `version` returns one release's full notes (`"8.1"` matches every 8.1.x), `since` returns the full notes of every release after an installed version, and no scope returns a compact release digest. `package` accepts npm or short names (`uni-angular` is the default).

- [`57a8c4c`](https://github.com/uni-design-system/uni/commit/57a8c4c73c852a6b14c2e2916cad9bd0a1566787) Thanks [@gaenglish](https://github.com/gaenglish)! - `export-dtcg-tokens`: W3C DTCG JSON (Style Dictionary compatible) for a built-in theme's color, radius, and spacing scales, named with Uni token ids — exposing core's existing `emitDtcgTokens` as an MCP tool for external token pipelines. The `UniTheme` JSON from the theme tools remains the lossless primary format.

### Patch Changes

- [`e706e38`](https://github.com/uni-design-system/uni/commit/e706e3887f47d8821cc1652410ad37a43d52a428) Thanks [@gaenglish](https://github.com/gaenglish)! - Ship `CHANGELOG.md` in the published packages. The release notes existed only in the repo; an installed package carried no record of what changed, so upgrade questions couldn't be answered from `node_modules`. uni-angular copies it into the ng-packagr `dist` via `assets`; the rest add it to `files`.

## 4.6.0

### Minor Changes

- [`5414517`](https://github.com/uni-design-system/uni/commit/5414517d52d17943a4730752ab5d90c304c37062) Thanks [@gaenglish](https://github.com/gaenglish)! - Runtime theme JSON: `generate-runtime-theme`, `get-runtime-theme`, and a theme registry endpoint

  `generate-uni-theme` returns `uni-theme.ts` **source** — codegen by design, and
  the right answer for branding an app permanently. It is the wrong answer when a
  theme needs to apply _now_: an agent had to write a file and rebuild. These tools
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

## 4.5.0

### Minor Changes

- [`c2421c0`](https://github.com/uni-design-system/uni/commit/c2421c04d01f36d74b489613d22997553f256d4f) Thanks [@gaenglish](https://github.com/gaenglish)! - Expand `BaseIcons` to 59 icons and add `uni-icon` sizing

  The 34-icon set shipped in 7.0.0 covered the library's own components but not a
  real application — an app migrating off inline `<svg>` (or off `uni-symbol`, in
  Angular) ran out of names almost immediately. Everything here is additive; all
  34 existing names are unchanged.
  - **25 new icons**, same Material Symbols Outlined 300 source and the same
    `0 -960 960 960` grid as the rest of the set: navigation (`link`, `expand`,
    `gridView`, `listView`), actions (`moreHorizontal`, `copy`, `send`,
    `refresh`, `dragHandle`, `qrCode`), feedback (`star`, `verified`) and
    user/system (`group`, `shieldPerson`, `clock`, `mail`, `chat`, `image`,
    `document`, `payment`, `bank`, `trendingUp`, `extension`, `webhook`,
    `logout`).
    - `moreHorizontal` ships alongside `more` because that one is `more_vert` and
      row-aligned menus need the horizontal kebab.
    - `star` is separate from `favorite`, which is the heart.
  - **`uni-icon` gains an optional `size` input** (`CssLength` — bare numbers are
    px, strings pass through, so `20` and `'1.25rem'` both work). Left unset,
    behaviour is unchanged: the icon fills its container, which is what lets a
    themed control size its own glyph through padding. Set, it applies
    width/height as inline styles, so an explicit size wins over the
    fill-the-container rule regardless of style injection order. This removes the
    per-call-site `width`/`height` CSS rule that replacing an inline `<svg>` with
    `<uni-icon>` would otherwise need.
  - The MCP `create-icon-tokens` tool now lists the built-in icon names above the
    token map it returns. Apps routinely hand-draw their own `close`, `check` or
    `plus`; encoding those into theme tokens works but adds redundant artwork on a
    foreign grid when the theme already ships the glyph. The tool cannot recognise
    a shape, so it hands the caller the list to check against before adding
    anything.

## 4.4.0

### Minor Changes

- [`f7727aa`](https://github.com/uni-design-system/uni/commit/f7727aa8895bd67f285ba4830858f994490bb7f7) Thanks [@gaenglish](https://github.com/gaenglish)! - Replace `BaseIcons` with a normalized 34-icon Material Symbols set

  The built-in icon set was 11 glyphs drawn from four different grids
  (`0 0 24 24`, `0 0 50 50`, `0 0 64 64`, `0 -960 960 960`), so `checkCircle` and
  `xCircle` rendered as solid filled discs next to a hairline `alertCircle` and an
  oversized `close` — three optical weights in one set.
  - `BaseIcons` is now Material Symbols Outlined at weight 300, every glyph on a
    single `0 -960 960 960` grid, grouped by intent: navigation (`menu`,
    `chevronUp/Down/Left/Right`, `arrowLeft/Right`, `home`, `externalLink`),
    actions (`search`, `close`, `plus`, `minus`, `more`, `delete`, `edit`,
    `download`, `upload`, `share`, `filter`), feedback (`check`, `checkCircle`,
    `xCircle`, `alertCircle`, `info`, `warning`, `lock`) and user/system
    (`profile`, `settings`, `notification`, `favorite`, `help`, `calendar`).
  - All 11 previously shipped names are preserved, so existing `<uni-icon>` call
    sites and theme overrides keep working. Their **appearance changes**: the
    filled `checkCircle`/`xCircle` are now outlined, and the set reads lighter
    overall. `spinner` is carried over verbatim, keyframes intact.
  - New `IconName` and `BaseIconName` types. `IconName` is
    `BaseIconName | (string & {})`, so built-ins autocomplete and typos surface
    while themes can still register arbitrary names via `createTheme({ icons })`.
    `uni-icon`'s `name` input is typed with it instead of `keyof Icons`.
  - **Breaking**: removes the unused `IconToken`, `IconStyle`, `ToggleableIcon`
    and `IconConfig` exports. Nothing in the library referenced them and
    `IconToken`'s 60-name union contradicted the actual `BaseIcons` keys. Use
    `IconName` instead.
  - New exported `svgToIconUri(svg, options?)` — the supported way to bring your
    own icons (a brand set, a designer handoff) into a theme. It normalizes the
    source (drops the xml declaration, comments and fixed `width`/`height` so the
    mask scales), percent-encodes it, and **rejects artwork that cannot survive
    masking**: no `viewBox`, an embedded raster `<image>`, an external reference,
    a gradient/pattern fill, or more than one paint color. That last one is the
    trap worth naming — masks use the alpha channel, so a multi-color logo
    flattens to a silhouette in `currentColor`; pass `{ allowMultiColor: true }`
    when that is intended. `createTheme({ icons })` merges the result over
    `BaseIcons` per name, so a built-in name reskins and a new name is added.
  - New MCP tool `create-icon-tokens`, the agent-facing front end to
    `svgToIconUri`: hand it a project's inline `<svg>` (or a brand set) and it
    returns a paste-ready `icons` map for `uni-theme.ts`. It encodes via the same
    helper, so tokens are byte-identical to the built-in set, and adds the
    set-level checks a per-icon helper cannot make — which names override
    built-ins, and whether the artwork mixes viewBox grids. Bad artwork is
    reported per icon rather than failing the batch, and re-running is safe
    (already-encoded URIs pass through). The server instructions now point agents
    at it whenever they encounter inline SVG.
  - `BaseIcons` is generated by `scripts/generate-icons.mjs` (`pnpm icons:generate`),
    which fetches from the canonical Material Symbols source and validates every
    glyph before writing — a malformed path, an off-grid viewBox or geometry
    outside the grid aborts the run. `pnpm icons:check` verifies the committed
    file without writing. Add or change icons in that script's manifest and
    regenerate; the file is not hand-edited. `icon.records.spec.ts` asserts the
    same invariants against the committed output.

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
