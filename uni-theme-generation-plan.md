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
- [ ] Visually verify the regenerated stock themes + Theme Builder in Storybook.
- [x] **Vitest suite in core**: 16 tests — round-trip, determinism, completeness, contrast
      corpus (1,080 seeds × both modes, zero failures), seed fidelity, dark chroma cap,
      ≤ 15 ms perf budget. `pnpm --filter @uni-design-system/uni-core test`

## Milestone 2 — Non-color generation

- [x] Extend `ThemeConfig`/`createTheme` to accept optional `radii` and `shadows` overrides.
- [x] `shape` input → `Radii` presets (`ShapeRadii` in `theme.generator.ts`), wired through
      `generateUniThemes`.
- [ ] Brand-tinted light shadows (≈ 6–8% primary hue in the alpha stacks); near-zero dark
      shadows + surface lightness stepping (shadows become theme-scoped, not shared).

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
  - [ ] Real-world e2e: fresh `ng new` + `ng add` + `ng serve` (needs a published or
        packed tarball); `npx … init` fallback for non-CLI workspaces.
- [ ] **Playground**: promote/extend the existing Theme Builder component into
      `apps/playground` with light+dark side-by-side, contrast report panel, exports
      (`uni-theme.ts` copy, pre-encoded `ng add` command, DTCG JSON).
  - [x] Theme Builder re-based on the engine: `targets` (soft brand anchors) plumbed
        through `BrandPaletteConfig`/`createThemeFromPalette`; nine curated AA-clean
        presets (Indigo, Ocean, Emerald, Sunset, Berry, Heritage, Sage & Clay, Pastel,
        Graphite) replace the old HSL-tuned four.
- [x] **MCP**: `generate-uni-theme` tool in `packages/mcp` returns the static file +
      provider snippet + contrast report; server instructions teach the
      edit-the-static-file retheming workflow.
  - [ ] Lint check rejecting raw hex in the MCP snippet corpus.
- [ ] W3C DTCG JSON emitter (shared by playground + MCP).

## Milestone 5 — Process

- [ ] Changeset (minor) for the engine; deprecations documented; removal deferred to a
      future major.
- [ ] Chromatic/Storybook visual regression snapshots of generated stock themes.
