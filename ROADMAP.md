# Uni Roadmap

Produced from a full-system audit (2026-08-04) against two bars: the
generative-UI promise (agent-generated, per-user personalized UI) and
top-tier component-library status (Material / Carbon / PrimeNG / Kendo).
Ranked by damage; quick wins flagged with ⚡ (high value, low effort).

## Quick wins

- ⚡ **Fix the MCP index JSDoc extraction bug.** `packages/mcp/src/build/angular-adapter.ts:98`
  looks for a JSDoc block ending immediately before `export class`, but every
  component's JSDoc sits above the `@Component({...})` decorator — so **71/71
  indexed components have empty `summary` and `description`**, and MCP search
  degrades to substring matching on ids. Highest damage-to-effort ratio in the
  repo.
- ⚡ **Surface WCAG results from `applyPalette`.** `BrandPaletteConfig` omits the
  `checks` sink from `GenerateColorsConfig`, so the one agent-facing runtime
  theming API returns no accessibility signal — while hard `brand` pins are
  documented to possibly fail contrast, silently. Return a `ContrastReport`
  (the theme-builder already computes one separately via `generateThemes()`).
- ⚡ **`ControlValueAccessor` bridge directive.** Form controls implement Signal
  Forms only (experimental); `formControlName` / `ngModel` don't bind, locking
  out every existing `ReactiveFormsModule` app. One small bridge unlocks the
  entire installed Angular base.
- ⚡ **Reconcile MCP versioning.** `uni-mcp` is 4.5.0 while the fixed group is
  at 7.1.0, and its README instructs pinning them equal; the tool table lists
  10 of the 11 registered tools.

## Track 1 — Generative UI

1. **Theme validation contract.** There is currently no validation of any kind:
   no schema, no `assertTheme`, no runtime WCAG assertion. Every scale is
   `Partial<Record<…>>`, so a malformed generated theme renders as `undefined`
   CSS silently. Ship a zod `UniTheme` schema in core (zod is already an MCP
   dependency), assert on `ThemeService.theme.set`, and make acceptance /
   rejection with reasons the API. This unblocks "custom theme representation
   and validation" (see Core/Theme roadmap note).
2. **Full-scale personalization.** `ThemeConfig` has no `typography`, `spacing`,
   or `thicknesses` fields; the base scales aren't exported; fonts are
   install-time `<link>` tags. Personalization today = colors + radii +
   shadows. Open the remaining scales to `createTheme` /
   `createThemeFromPalette` / `applyPalette`, and design runtime font loading.
3. **Runtime theme registration.** `UNI_THEMES` is bootstrap-frozen; there is no
   `registerTheme()`; a runtime `applyPalette` theme never appears in
   `uni-theme-switch` (its `selectedThemeKey` isn't among the options — a live
   inconsistency today). Add register/unregister and make `themeOptions`
   reactive.
4. **Runtime theme JSON path in the MCP.** `generate-uni-theme` returns a `.ts`
   file to write and compile — codegen by design. Add a tool that returns a
   validated `UniTheme` as JSON for immediate `applyPalette`-style application,
   plus a documented apply API.
5. **Slot / content-projection metadata.** 0/71 indexed components describe what
   they may contain, so agents can configure components but not compose
   layouts. Add slot metadata to the index schema and adapter.
6. **Structured MCP output.** All 11 tools return markdown; agents re-parse
   prose for prop types. Add `structuredContent` / output schemas alongside the
   text.
7. **Responsive primitives.** No breakpoint tokens on any layout primitive —
   adaptive layouts force raw media queries, breaking the no-CSS promise where
   generated UIs need it most. Port the breakpoint service (TODO.md) and add
   responsive token inputs to `box-layout`.
8. **Emit CSS custom properties.** Nothing writes theme tokens to `:root`, so
   non-Uni content (charts, embeds, third-party widgets) can't reach theme
   values. An opt-in `--uni-*` variable emission bridges the gap.
9. **SSR stance.** Client-side-only is documented and honest, but it forecloses
   server-side generative rendering; Angular 21 defaults to SSR. Revisit as a
   strategy decision (Emotion extraction + `isPlatformBrowser` guards on
   `body-render`, `dropdown`).

## Track 2 — Top-tier component library

1. **React package credibility.** Published at 7.1.0 with ~8 components (11%
   parity with Angular's 53), zero tests, no test script (CI silently skips
   it), TS errors on main, and third-party runtime deps that contradict the
   zero-deps policy. Fix, de-publish, or mark experimental — the current state
   undermines trust in the Angular package.
2. **Table-stakes components:** date picker / time picker / date-range, virtual
   scroll (caps `data-table`), tree, stepper, form-bound autocomplete, chips
   input, standalone spinner, number/password/OTP inputs, list. (TODO.md
   already tiers most of these.)
3. **i18n.** Hardcoded, non-overridable English strings ship in components
   (`aria-label="Pagination"`, dialog "Close", …). Make every string an input
   and/or provide an injectable strings token. Hard blocker for any non-English
   deployment.
4. **RTL below the token layer.** Physical properties throughout (dialog close
   button `right: 12`, toggle `translateX`, select arrow `right: 0`) render
   wrong in RTL. Systematic sweep to logical properties
   (`insetInlineEnd`, `marginInlineStart`, `paddingInline`).
5. **Test depth.** 144 `it()` blocks total; 51% of specs are smoke-only; the
   most complex components (`data-table`, `paginator`, `popover`,
   `multi-select-dropdown`, `sort-header`, …) have zero specs. Add behavioral
   specs to the complex components first; adopt Storybook interaction tests.
6. **Automated a11y gate.** `addon-a11y` is installed but never asserted — the
   excellent hand-written a11y work has no regression net. Wire axe assertions
   into CI.
7. **Visual regression.** Chromatic is a (React-only) dependency but unwired.
   Pick a VR path and gate the Angular Storybook with it.
8. **Forms UX layer.** No `uni-form-field` / error / hint triad — every consumer
   re-implements validation display.
9. **Docs depth.** ~46 lines average per component MDX; no keyboard-interaction
   tables, no per-component a11y sections, no migration notes.
10. **Density system.** Individual `size` inputs exist but there's no global
    density knob (Material `--mat-density`, Carbon size scale equivalents).
11. **Support surface.** No browserslist / machine-readable browser matrix
    (library bets on Baseline-2026 features), no deprecation policy, no git
    tags / GitHub Releases, no per-major migration guides.
12. **Small dangling APIs.** `footer` declared in `ComponentName` with theme
    options but never built; `aria-live` regions absent for async state
    (table load completion, filter counts).

## Strengths to defend (don't regress these)

- The OKLCH engine: dependency-free, deterministic, ≤15ms, WCAG-corpus-tested.
- Signal-driven Emotion theming — runtime palette swaps genuinely re-render.
- Token-only component surface with no style escape hatch.
- Platform-native primitives (native `<dialog>`, popover API, CSS anchor
  positioning) keeping runtime deps at zero.
- Systematic a11y craft: lint-enforced template a11y, `motionSafe`,
  reference-quality tabs/menu keyboard interaction.
- Agent tooling nobody else ships: MCP server with style/behavioral token
  split, `llms.txt`, `AGENTS.md`, schematics.
- Changeset discipline and OIDC trusted publishing.
