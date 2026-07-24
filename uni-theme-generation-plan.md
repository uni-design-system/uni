# Theme Generation — Action Plan

Audit of the codebase against `uni-theme-generation-prd.md` (July 2026). Ordered so the
muddy-palette fix lands first. Tick items as they land.

## Milestone 1 — OKLCH engine core (`packages/core/src/concepts/generation/`) — fixes muddiness

- [x] **OKLCH primitives** (zero-dep): `hexToOklch`, `oklchToHex`, sRGB gamut mapping
      (reduce C, preserve L/H). PRD §4 rounding fix applied — scale before rounding.
      → `concepts/generation/oklch.helper.ts`
- [x] **Round-trip test**: `oklchToHex(hexToOklch(x)) ≈ x` within 1 bit/channel.
- [x] **Re-base the tone architecture in OKLCH**: `toneMap` now uses perceptual OKLCH L
      slots (light + inverted dark). → `concepts/generation/palette.factory.ts`
- [x] **Chroma model**: `CategoryChroma` replaces `CategorySaturation`; surfaces micro-tint,
      dark-mode chroma decoupling capped at C 0.16.
- [x] **WCAG guard-rail loop** (`ensureContrast`): L-only walk (H never, C last), ≤ 50
      iterations, direction chosen by achievable contrast ceiling; all §3.6 pairs recorded
      into `ContrastReport` (110 checks per light+dark pair).
- [x] **Public API** per §3.3: `GenerationInput`, `GeneratedThemeConfig`, `generateThemes()`,
      `generateUniThemes()`. Seeds honored verbatim when already AA; explicit `vibe` caps
      chroma; category inferred from seed chroma otherwise.
- [x] **Token completeness**: test asserts generated key set ⊇ `BaseTheme` key set.
- [x] **Back-compat**: `generatePalette` is now a thin wrapper over `generateColors`;
      `uniColor`, `randomRangeValue`, `CategorySaturation`, `CategoryLightness` marked
      `@deprecated`; `schemeHues` moved to `color.utils.ts`.
- [x] **Shipped Light/Dark themes regenerated** automatically via the wrapper.
- [x] Visually verify the regenerated stock themes + Theme Builder in Storybook
      (passed 2026-07-23).
- [x] **Vitest suite in core**: 16 tests — round-trip, determinism, completeness, contrast
      corpus (1,080 seeds × both modes, zero failures), seed fidelity, dark chroma cap,
      ≤ 15 ms perf budget. `pnpm --filter @uni-design-system/uni-core test`

## Milestone 2 — Non-color generation

- [x] Extend `ThemeConfig`/`createTheme` to accept optional `radii` and `shadows` overrides.
- [x] `shape` input → `Radii` presets (`ShapeRadii` in `theme.generator.ts`), wired through
      `generateUniThemes`.
- [x] Brand-tinted light shadows (`generateShadows` in `concepts/generation`); near-zero
      dark shadows (raised `none`, faint overlay veil) + error-tinted warn glow. Shadows
      are theme-scoped: wired through `generateThemes`, `generateUniThemes`,
      `createThemeFromPalette`, the emitted theme file, and the stock Light/Dark themes.

## Milestone 3 — Input flexibility

- [x] 2–3 hex input: `classifyScheme` hue-distance classification → `ColorScheme`, seeds
      assigned to primary/secondary/tertiary as guard-railed soft targets.
- [x] `vibe` → `ColorCategory` (direct), with seed-chroma inference (`inferCategory`) as
      the default; free-text keyword mapping deferred to the consumer surfaces.
- [ ] (Stretch, Phase 5) image dominant-color extraction.

## Milestone 4 — Consumer surfaces

Direction (2026-07-23): static theme files are the source of truth — MCP/schematic emit
them at scaffold time; the engine never runs in the browser. Enablers landed:
`createTheme` deep-merges `borders`/`components` overrides; `emitThemeFile()` in
`concepts/generation` renders the editable `uni-theme.ts` (shared by schematic + MCP).

- [x] **`ng add` schematic** (`packages/angular/schematics-src`, bundled to
      `dist/schematics` with uni-core inlined): installs deps, prompts brand/shape/dark,
      writes `uni-theme.ts` via `emitThemeFile`, registers `UNI_THEMES`, typeface links,
      smoke test, contrast summary; idempotent; 13-spec suite.
  - [x] Real-world e2e (2026-07-23): fresh `ng new` + `ng add` against published 5.0.0.
        Caught two packaging bugs — ESM/CJS mismatch (ng-packagr stamps `type: module`;
        fixed via nested `schematics/package.json`) and emitter dot-access vs
        `noPropertyAccessFromIndexSignature` (fixed: bracket access). App builds clean;
        fixes ship in the next patch release.
  - [ ] `npx … init` fallback for non-CLI workspaces; `ng serve` computed-style
        assertion (browser automation).
- [x] **Playground** (2026-07-23): Theme Builder extended in place — light+dark
      side-by-side panels, live contrast pass/fail matrix, shape-language input (radii
      applied live), and all three exports (`uni-theme.ts` via `emitThemeFile`,
      pre-encoded `ng add` command, DTCG JSON via `emitDtcgTokens`). Deploys with the
      existing Storybook Pages workflow; a standalone `apps/playground` remains optional
      if a chrome-free URL is ever wanted.
  - [x] Theme Builder re-based on the engine: `targets` (soft brand anchors) plumbed
        through `BrandPaletteConfig`/`createThemeFromPalette`; nine curated AA-clean
        presets (Indigo, Ocean, Emerald, Sunset, Berry, Heritage, Sage & Clay, Pastel,
        Graphite) replace the old HSL-tuned four.
- [x] **MCP**: `generate-uni-theme` tool in `packages/mcp` returns the static file +
      provider snippet + contrast report; server instructions teach the
      edit-the-static-file retheming workflow.
  - [x] Raw-hex lint (2026-07-23): `integrity.spec.ts` in packages/mcp fails on hex in
        example snippets, API metadata, guidelines, or generate-tool guidance (theme-file
        content and generation inputs excluded); runs via `turbo run test` in CI.
- [x] W3C DTCG JSON emitter (`emitDtcgTokens` in `concepts/generation`), consumed by the
      playground export; wiring it into an MCP tool remains open.

## Milestone 5 — Process

- [x] Changeset (minor) covering engine + schematic + MCP tool
      (`.changeset/oklch-theme-generation-engine.md`); deprecations documented; removal
      deferred to a future major.
- [ ] Chromatic/Storybook visual regression snapshots of generated stock themes.
