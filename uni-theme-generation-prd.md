# Product Requirements Document (PRD)

## Uni Design System — Theme Generation & Frictionless Angular Onboarding

**Target repo:** [`uni-design-system/uni`](https://github.com/uni-design-system/uni)
**Packages affected:** `@uni-design-system/uni-core`, `@uni-design-system/uni-angular` (+ playground app, MCP server)
**Status:** Draft for review · July 2026

---

## 1. Executive Summary & Core Intent

### 1.1 Document Purpose

This document specifies an intelligent, edge-optimized **Design Token & Theme Generation Engine** built *into* `@uni-design-system/uni-core`, and the three consumer surfaces that use it to collapse Uni's adoption funnel: an **`ng add` schematic**, a **web playground**, and an **MCP server**. The engine generates complete, WCAG-compliant `UniTheme` objects (light and dark) from minimal brand input, so a new Angular team goes from "here's our brand hex" to fully themed Uni components in under ten minutes.

### 1.2 Context & Developer Pain Points

Uni's current theming model is architecturally strong — `createTheme({ id, name, colors })` derives borders, component variants, and the full theme graph from a single semantic `Colors` map — but two things stand in the way of adoption:

1. **Color math.** The existing generation helpers in `uni-core` (`uniColor()`, `randomRangeValue()`, `CategorySaturation`/`CategoryLightness`, and the hue-wheel utilities in `concepts/color`) operate in **HSL**. HSL ignores perceptual lightness — pure blue reads far darker than pure yellow at identical HSL lightness — producing muddy, inconsistent palettes when scales are derived programmatically. This PRD replaces that math with **OKLCH**, keeping the existing public concepts (`ColorScheme`, `ColorCategory`, `Palette`) as the intent vocabulary.
2. **Onboarding friction.** Today a new Angular consumer must: install `@uni-design-system/uni-angular`, discover and install three peer dependencies (`@uni-design-system/uni-core`, `@emotion/css`, `@angular/forms`), hand-author a ~74-key semantic `Colors` map (or accept the default M3 purple), register it via the `UNI_THEMES` injection token, and load the Red Hat Display / Roboto typefaces. Every one of those steps is a drop-off point.

```
        [ Inputs: Brand Hex · 2–3 Colors · Logo Image · Text "Vibe" ]
                                   │
                                   ▼
              [ OKLCH Transformation Layer — uni-core ]
                                   │
            ┌──────────────────────┴──────────────────────┐
            ▼                                             ▼
  [ Light Colors Pipeline ]                     [ Dark Colors Pipeline ]
    ├─ Ease-curve L scaling                       ├─ Inverted L scaling
    ├─ High-chroma protection                     ├─ Safe chroma decoupling
    └─ WCAG guard-rail loop                       └─ WCAG guard-rail loop
            │                                             │
            └──────────────────────┬──────────────────────┘
                                   ▼
        [ createTheme() → UniTheme pair (LightTheme / DarkTheme) ]
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
[ ng add schematic ]      [ Web Playground ]         [ AI MCP Server ]
 (zero-to-styled app)     (live preview + export)    (AI context scaffolding)
```

### 1.3 Key Objectives

* **Perceptual vibrancy:** All lightness/chroma manipulation happens in **OKLCH**, so light/dark derivation preserves hue and perceived saturation. The HSL-random generation path is deprecated.
* **Programmatic accessibility:** A contrast guard-rail mathematically enforces **WCAG 2.2 AA** on every `X` / `on-X` token pair the engine emits (4.5:1 for content tokens, 3:1 for `-border` and outline tokens), extending the existing "(WCAG AA)" guarantee documented on `ThemePalette`.
* **Native output shape:** The engine's only output is Uni's own `Colors` map (plus optional `Radii`/`Shadows` overrides) — it feeds directly into `createTheme()` and the `UniThemes` record. No parallel token taxonomy.
* **Triple-consumer distribution:** `ng add @uni-design-system/uni-angular` for Angular teams, an interactive playground for humans, and a **Model Context Protocol** server so AI tools (Claude, Cursor) scaffold correct Uni code on the first attempt.

---

## 2. Adoption Funnel & Friction Requirements

The unifying product goal: **minimize time-to-first-themed-component (TTFTC) for Angular teams.**

| Funnel stage | Today | Target experience |
| --- | --- | --- |
| **Discover** | Storybook docs (GitHub Pages) | Unchanged, plus a "Theme it with your brand" entry point linking to the playground |
| **Generate** | Hand-author ~74 semantic color keys, or fork the M3 purple defaults | Playground or MCP: brand hex in → complete light+dark `UniTheme` out |
| **Install** | Manual install of `uni-angular` + 3 peer deps | `ng add @uni-design-system/uni-angular` — one command installs everything |
| **Wire up** | Read source to find `UNI_THEMES` token; hand-write provider | Schematic writes `uni-theme.ts` + provider registration automatically |
| **First component** | Copy from Storybook, hope the theme resolves | Schematic drops a smoke-test component using `uni-button`/`uni-text`; renders correctly themed on first `ng serve` |

**Acceptance metric:** A developer with an existing Angular 21 app and a brand hex reaches a rendered, brand-themed `uni-button` in **≤ 10 minutes / ≤ 3 commands**, without reading library source.

---

## 3. Core Functional Requirements (Engine, in `uni-core`)

### 3.1 Placement & Compatibility

* Lives in `packages/core` as a new concept: `src/concepts/generation/` (exported from the package root like every other concept).
* Reuses existing types as its public vocabulary: `ColorScheme`, `ColorCategory` (`concepts/color`), `Palette` (`concepts/palette`), `ThemePalette` (`concepts/theme/palettes`), `Colors`, `Radii`, `Shadows`, `UniTheme` (`concepts/theme`).
* The HSL helpers (`uniColor`, `randomRangeValue`, `CategorySaturation`, `CategoryLightness`) are marked `@deprecated` and re-implemented as thin wrappers over the OKLCH engine to avoid breaking existing callers. Removal follows the changeset `major` process.
* **Determinism:** unlike `randomRangeValue`, generation is pure — same input, same theme. Randomized "surprise me" output is an explicit playground feature (seeded), never engine default.

### 3.2 Input Flexibility Matrix

| Input level | Provided data | Engine operational logic |
| --- | --- | --- |
| **Minimum** | Single hex string | Extrapolates the full semantic `Colors` map: `primary` scale from the seed; `secondary`/`tertiary` from hue-wheel relationships (reusing `getComplimentaryHue`, `getAnalogousHues`, `getTriadicHues` from `concepts/color`, re-scored in OKLCH); neutral `background`/`surface`/`surface-variant` as micro-chromatic tints of the brand hue; utility roles (`warn`, `success`, `alert`, `info`) snapped to `RoleHues` ranges. |
| **Medium** | Array of 2–3 hex colors | Computes angular hue distances to classify intent against `ColorScheme` (`analogous`, `complimentary`, `splitComplimentary`, `triadic`, `monochromatic`), assigns colors to `primary`/`secondary`/`tertiary` roles, derives the rest as above. |
| **Maximum** | Image asset or text "vibe" | **Image:** edge-safe pixel downsampling isolates dominant color clusters; the top cluster seeds `primary`, runners-up seed `secondary`/`tertiary`. **Text:** keywords map onto `ColorCategory` (`jewel`, `pastel`, `earth`, `neutral`, `florescent`), which set OKLCH chroma caps and lightness bands — replacing the current HSL `CategorySaturation`/`CategoryLightness` tables with perceptual equivalents. |

### 3.3 Output Contract

The engine emits a `GeneratedThemeConfig` that plugs directly into existing machinery:

```typescript
import type { Colors, Radii, Shadows, UniTheme } from '@uni-design-system/uni-core';

export interface GenerationInput {
  seed: string | string[];          // hex | 2–3 hex values
  vibe?: ColorCategory;             // 'jewel' | 'pastel' | 'earth' | 'neutral' | 'florescent'
  scheme?: ColorScheme;             // override auto-classified intent
  shape?: 'sharp' | 'modern' | 'playful';
  name?: string;                    // theme display name, defaults to "Brand"
}

export interface GeneratedThemeConfig {
  lightColors: Colors;              // full semantic map — every token BaseTheme defines
  darkColors: Colors;
  radii?: Radii;                    // only when `shape` is provided
  shadows?: Shadows;                // brand-tinted, keyed by Elevation
  report: ContrastReport;           // machine-readable WCAG audit (see 3.6)
}

export function generateThemes(input: GenerationInput): GeneratedThemeConfig;

// Convenience: returns registered-ready UniTheme pair via createTheme()
export function generateUniThemes(input: GenerationInput): { light: UniTheme; dark: UniTheme };
```

**Hard requirement:** `lightColors`/`darkColors` must populate **every key that `BaseTheme`'s `lightColors`/`darkColors` populate** — including the extended families added in the Omni port (`primary-surface` … `quaternary-surface`, `*-container-variant`, `*-container-border`, `disabled-*`, `inverse-*`). A generated theme must never resolve fewer tokens than the default theme, or components will silently lose styles (`buildBorders`/`buildComponents` derive from this map).

### 3.4 Color Pipelines

* **Light pipeline:** ease-curve lightness scaling in OKLCH; high-chroma protection clamps C so `primary` survives the `enforceAccessibility` loop without hue drift; container tokens (`primary-container` etc.) at high L / low C; content tokens (`on-*`) driven to their contrast targets by L-only adjustment.
* **Dark pipeline:** inverted lightness scaling with **chroma decoupling** (dark `primary` caps at C ≈ 0.16 to avoid neon vibration on dark surfaces — mirroring how `genericDarkTheme` lightens `#0066B2` → `#4DABFF`); `background`/`surface`/`surface-variant` as very-low-L micro-chromatic brand tints, never pure black.
* Both pipelines end in the **WCAG guard-rail loop** (§3.6).

### 3.5 Non-Color Generation (Aligned to Uni's Actual Scales)

**A. Radii ("shape language").** Uni's `Radii` scale is `none | xxs | xs | sm | md | lg | max` (currently `4px → 32px`, `max: 999px`). The `shape` input emits a full override of that scale — same keys, different values:

| Config | Emitted scale (xxs → lg) | max |
| --- | --- | --- |
| `sharp` | all `0px` | `0px` |
| `modern` | `4px · 8px · 16px · 24px · 32px` (current BaseRadii — default) | `999px` |
| `playful` | `8px · 16px · 24px · 32px · 48px` | `9999px` |

*No new radius keys are introduced; component themes keep resolving `radii[size]` untouched.*

**B. Spacing.** Uni's `BaseSpacing` geometric scale (`xxs: 2px → xl: 64px`) is already sound and is **not** generated — the engine leaves `createTheme`'s spacing alone. (The original PRD's 4px-progression spacing engine is out of scope; revisit only if a density axis is added to `UniTheme`.)

**C. Shadows & elevation.** Uni keys shadows by `Elevation` (`raised | menu | dialog`) plus `warn`. The engine regenerates these:
* **Light themes:** replace the current dead-neutral `rgba(0,0,0,…)` stacks with brand-tinted alpha (≈ 6–8% of `primary`'s hue mixed into the shadow color) to reduce visual mud.
* **Dark themes:** near-zero shadows; elevation is communicated by the generated `bgElevated`-analog tokens (`surface` → `surface-variant` → `inverse-surface` lightness steps) and fine luminous borders via `buildBorders`. This becomes possible for the first time because light/dark shadows are theme-scoped, not shared.

**D. Gradients & glassmorphism (stretch).** Multi-stop gradients computed as Δh ± 15° walks in OKLCH, emitted through the existing `concepts/gradient` model; glass tokens (`alpha: 0.6` + `backdrop-filter: blur(12px)`) attach to `concepts/masking`. Ship after core, behind the same API.

### 3.6 The WCAG Guard-Rail (Contrast Contract)

Uni's semantic naming makes the accessibility contract mechanical — every content token names its surface:

* Every `on-X` vs `X` pair: **≥ 4.5:1** (AA text). `on-background`, `on-surface`, `on-surface-variant` included.
* Every `on-X-container-variant` (muted content) vs `X-container`: **≥ 4.5:1**.
* Every `on-X-container-border` and `outline` vs its surface: **≥ 3:1** (non-text UI).
* `primary`/`secondary`/`tertiary`/`warn`/`success` as *text on* `background` and `surface`: **≥ 4.5:1** (they're used as standalone ink by `Text`/links).

Enforcement is the original PRD's iterative loop, unchanged in spirit: adjust L in OKLCH (never H, C-last) until the pair passes, ≤ 50 iterations, relative-luminance math per WCAG 2.2. The `ContrastReport` in the output lists every checked pair, its ratio, and pass level (`AA`/`AAA`) — consumed by the playground UI, the schematic's console summary, and CI tests.

---

## 4. Reference Implementation Notes

The mathematical core from the original PRD (OKLCH→sRGB conversion, relative-luminance contrast, `enforceAccessibility` loop) carries over **verbatim as internal functions** of `concepts/generation` — with these adaptations:

* `generateDualTheme()`'s flat `UIThemeMode` (`bgMain`, `bgSurface`, `bgElevated`, `textMain`, `textMuted`, `primary`, `primaryHover`, `border`) is **removed**. Its role mapping becomes: `bgMain → background`, `bgSurface → surface`, `bgElevated → surface-variant`/`inverse-surface` step, `textMain → on-background`, `textMuted → on-background-variant`, `primary → primary`, `primaryHover → components` state derivation (hover states already live in `buildComponents`' variant records), `border → outline` + `buildBorders`.
* Hex in, hex out: `Colors` values are plain CSS color strings, matching every existing theme file. (`oklch()` CSS output is unnecessary — Uni styles via Emotion with resolved values from `ThemeService`, not CSS custom properties.)
* Known bug to fix in the carried-over code: the original `oklchToHex` rounds *before* scaling to 0–255 (`Math.round(clm…)` wraps the gamma transfer, not `× 255`), which collapses every channel to `00`/`01`. Correct: `Math.round(255 × transfer(clm))`.
* Build constraints inherited from `uni-core`: Vite single-entry bundling (`dist/esm/index.js`, `dist/cjs/index.cjs`, isolated `dist/types/`), no unextended relative-path imports, strictly zero runtime dependencies.

---

## 5. Consumer Interfaces

### 5.1 `ng add` Schematic (`@uni-design-system/uni-angular`)

The single highest-leverage friction fix. `ng add @uni-design-system/uni-angular` must:

1. **Install everything:** `@uni-design-system/uni-angular`, `@uni-design-system/uni-core`, `@emotion/css`, and verify `@angular/forms` — versions matched to the coordinated (fixed) release version. No peer-dependency archaeology.
2. **Prompt minimally:** brand hex (default: skip → ship stock Light/Dark themes), shape (`sharp | modern | playful`, default `modern`), dark mode (default yes).
3. **Generate `src/app/uni-theme.ts`:** calls `generateUniThemes()` from `uni-core` **at schematic time** and writes the *resolved* `Colors` maps into the file as literal `createTheme({...})` calls — the generated file is plain reviewable data, diffable in PRs, and carries a header comment with the regeneration command.
4. **Register the provider** in `app.config.ts`:
   ```typescript
   { provide: UNI_THEMES, useValue: { BrandLight, BrandDark } }
   ```
   (First key wins as default, matching `DefaultThemeId` behavior; `ThemeService` persistence via `LocalStorageService` keeps working.)
5. **Load typefaces:** add Red Hat Display + Roboto links to `index.html` (skippable flag), since `BaseTypography` depends on them.
6. **Scaffold a smoke test:** optionally add a `uni-button` + `uni-text` snippet to the app component so `ng serve` immediately proves the theme resolves.
7. **Print the contrast report summary** (pairs checked, worst ratio, AA/AAA level) to the console.

*Non-Angular-CLI consumers (Nx, custom builders) get the same result via a documented `npx @uni-design-system/uni-angular init` fallback that runs the identical schematic logic.*

### 5.2 Browser Visual Playground

A client-side tool (deployed alongside the existing GitHub Pages Storybook; buildable as an `apps/playground` workspace app) that closes the "generate" funnel stage:

* **Real-time syncing:** color/vibe/shape inputs re-run `generateThemes()` on every change (< 15 ms budget makes this interactive); light and dark previews render side by side.
* **Real components as the test bed:** the preview renders actual Uni components (buttons, cards, inputs, badges across variants `primary`…`warn`) — not lookalike mockups — so what you see is exactly what `ThemeService` will resolve.
* **Contrast report panel:** the `ContrastReport` rendered as a pass/fail matrix; failing pairs (only possible if a user hand-overrides a token) highlighted with suggested fixes.
* **Export paths, in priority order:**
  1. **Copy `uni-theme.ts`** — the same literal `createTheme` file the schematic writes, paste-ready.
  2. **Copy the `ng add` command** with inputs pre-encoded (`ng add @uni-design-system/uni-angular --brand=#0052FF --shape=modern`).
  3. **W3C DTCG / Style Dictionary JSON** for teams piping tokens into other systems (see §6).

### 5.3 AI Developer MCP Server

A standalone MCP server (stdio; published as `@uni-design-system/uni-mcp` or run via `npx`) so AI coding agents generate *correct Uni-native* code instead of hardcoded hex:

**Tools:**

| Tool | Input | Output |
| --- | --- | --- |
| `generate_uni_theme` | `{ brandHex, vibe?, scheme?, shape? }` | The literal `uni-theme.ts` content + provider registration snippet + `ContrastReport` |
| `get_theme_tokens` | `{ mode: 'light' \| 'dark' }` | The resolved semantic `Colors`/`Radii`/`Spacing` maps, so agents reference token *names* |
| `scaffold_component_usage` | `{ component: 'button' \| 'dialog' \| … }` | Correct Angular 21 usage: standalone imports, **signal-based inputs** (`input()`/`output()`/`model()`), variant/size enums from `uni-core` |

**Integrity requirements:**

* The original PRD's stub (`const calculatedOklch = { l: 0.5, c: 0.2, h: 220 }`) is replaced with real hex→OKLCH parsing — the MCP must honor the caller's actual brand color.
* Tool descriptions must instruct agents to style through `ThemeService` accessors (`colorPair('primary')`, `textClass('body-1-short', 'on-surface')`, `getSpacing('md')`) and semantic tokens — **never** emit hardcoded hex or raw CSS colors into generated components.
* `scaffold_component_usage` reflects the current component API surface (e.g. `Text typeface=` not `role=`), sourced from the same metadata as `docs:api` generation, so it can't drift from the library.

---

## 6. Output Specifications (Interop Layer)

Primary output is the native `UniTheme` object graph — no translation loss for Uni consumers. For external pipelines, the playground and MCP additionally emit W3C DTCG-format JSON mapping Uni's semantic names, compatible with Style Dictionary:

```json
{
  "color": {
    "primary":        { "$value": "#0052FF", "$type": "color" },
    "on-primary":     { "$value": "#FFFFFF", "$type": "color" },
    "surface":        { "$value": "#FBFBFE", "$type": "color" }
  },
  "size": {
    "radius": { "md": { "$value": "24px", "$type": "dimension" } },
    "spacing": { "md": { "$value": "16px", "$type": "dimension" } }
  }
}
```

Token names in the JSON are exactly Uni's `ColorToken` strings — one vocabulary everywhere.

---

## 7. Non-Functional Requirements & Verification

### 7.1 Performance & Footprint Budgets

* **Zero dependencies:** the engine uses only standard runtime JavaScript. No Chroma.js/culori. (Matches `uni-core`'s existing footprint.)
* **≤ 15 ms** to generate a full light+dark `GeneratedThemeConfig` on typical consumer hardware — required for the playground's real-time re-render.
* **Tree-shakeable:** apps that never generate themes at runtime (the expected default — the schematic bakes themes at scaffold time) pay ~0 bytes; verify via bundle analysis in CI.

### 7.2 Monorepo Process Requirements

* Ships under the **fixed/coordinated version** with `uni-core`/`uni-react`/`uni-angular` via `@changesets/cli`; schematic peer ranges are stamped from the release version automatically.
* Engine tests run in `uni-core`'s Vitest suite; schematic gets its own spec suite in `packages/angular`.
* Node `>= 22.13.0`, `pnpm@11`, Turborepo task graph — no new toolchain.

### 7.3 QA Acceptance Checklist

* **Contrast property tests:** for a corpus of ≥ 1,000 seed hexes (uniform hue sweep × lightness × chroma extremes), every pair in §3.6 passes its threshold in both modes. Zero tolerance.
* **Token completeness test:** generated `Colors` key set ⊇ `BaseTheme` key set (guards §3.3's hard requirement; fails the build if `BaseTheme` gains tokens the generator doesn't know).
* **Round-trip test:** `oklchToHex(hexToOklch(x)) ≈ x` within 1 bit/channel (guards the conversion-bug class called out in §4).
* **Schematic e2e:** fresh `ng new` app + `ng add` + `ng serve` renders the smoke-test component with the brand theme; assert resolved computed styles, not just compilation.
* **Determinism test:** identical `GenerationInput` yields byte-identical output.
* **AI tool integrity:** MCP-guided generation of a sample component must reference semantic tokens through `ThemeService`; a lint check on the MCP's snippet corpus rejects raw hex literals.
* **Visual regression:** generated stock themes snapshot-tested through the existing Storybook deploy (per the roadmap's Chromatic directive).

---

## 8. Rollout & Sequencing

1. **Phase 1 — Engine in `uni-core`:** `concepts/generation`, OKLCH primitives, guard-rail, tests. Deprecate HSL helpers. *(Unblocks everything; independently shippable as a minor.)*
2. **Phase 2 — `ng add` schematic:** biggest TTFTC win; needs only Phase 1.
3. **Phase 3 — Playground:** `apps/playground`, deployed with existing Pages workflow.
4. **Phase 4 — MCP server:** `packages/mcp` (or standalone repo), consuming the published `uni-core`.
5. **Phase 5 — Stretch:** gradients/glass tokens, image-input extraction, React `init` parity.

Each phase lands behind the normal changeset flow; no phase requires a breaking change until the deprecated HSL helpers are removed (future major).
