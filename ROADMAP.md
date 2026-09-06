# Uni Roadmap

Produced from a full-system audit (2026-08-04) against two bars: the
generative-UI promise (agent-generated, per-user personalized UI) and
top-tier component-library status (Material / Carbon / PrimeNG / Kendo).
Ranked by damage; quick wins flagged with ⚡ (high value, low effort).

**Revised 2026-09-06** — figures re-verified against the tree at 10.4.0, items
delivered since the audit retired, and the list given an explicit priority.
Where this file and `TODO.md` disagree, the priority below wins.

## Priority

**P0 — blocks consumers today.**

1. **Angular 22.** `@angular/core` is peered at `^21.2.0`, which excludes v22
   outright, so an app that took v22 (released 2026-06-03) cannot install us
   without a peer override. The READMEs say "tracks one Angular major (current:
   Angular 21)", which is internally honest but contradicts promoting the
   latest Angular. Widen the peer range and cut the major that tracks v22.
   Signal Forms went stable in v22, which retires the "experimental forms API"
   caveat everywhere it appears below. v22 also makes OnPush the default; every
   component here already sets it explicitly, so that costs nothing.
2. **i18n** (Track 2 §3) and **RTL** (Track 2 §4). Hard blockers for
   non-English and RTL deployments; neither has a workaround a consumer can
   apply from outside the library.

**P1 — the recurring defect class.** Every consumer-reported bug of the last
release cycle was the same shape: a component hardcoded something the theme
should own, or two components each owned a copy and drifted (button focus ring,
icon-button hover, dialog/drawer scrim, dialog/drawer motion). Get ahead of it:

3. ~~**Finish the motion-token migration.**~~ Done for 11.0.0. Every duration
   in the library now resolves through the `motion` scale: `slider.transitionMs`
   (the last option outside it) plus seventeen hardcoded sites across twelve
   components. Two of those were baked into the *theme* rather than a
   component — `button.fixed` and `tag.fixed` — and the button's beat the
   component that had already been migrated, so it kept 0.28s regardless. The
   scale gained `snap` (120ms) for a control covering distance. Specs now fail
   if a shipped theme states a duration in a style block.
4. **Theme coverage reporting.** Nothing tells a theme author what they have
   not dressed. The Wellsourced theme covers 13 of 59 component entries — it
   themes `dialog` but not `dialogHeader`/`dialogButtons`, and no `drawer*` at
   all, which is exactly how its drawer inherited a scrim that clashed with its
   own dialog. Add a `themeCoverage()` helper in core, a Storybook page, and an
   MCP tool so an agent can answer "what does this theme still need?".
5. **Fix the registry that lies.** Five names in `ComponentName` cannot be
   reached: `footer` (declared *and* themed at `base.theme.ts:549`, never
   built), and `textButton`, `buttonGroup`, `progressBar`, `select` (no theme
   entry and no `COMPONENT_NAME` provider). Build, wire, or delete each.

**P2 — depends on a decision, not on effort.**

6. **`ControlValueAccessor` bridge.** Downgraded from ⚡: with Signal Forms
   stable this is no longer about betting on an experimental API, only about
   consumer code still on `ReactiveFormsModule`. Worth doing if a consumer has
   legacy reactive-forms screens; skip it if they are migrating to Signal
   Forms anyway. Decide with the consumer, not on principle.
7. **React package.** Still the credibility question in Track 2 §1 — fix,
   de-publish, or mark experimental.

Everything else keeps its Track 1 / Track 2 ordering below.

## Quick wins

- ⚡ **Finish the MCP index JSDoc extraction fix.** `packages/mcp/src/build/angular-adapter.ts:98`
  looked for a JSDoc block ending immediately before `export class`, but every
  component's JSDoc sits above the `@Component({...})` decorator. Partly fixed:
  **52 of 84** indexed components still have an empty `summary` (was 71/71), so
  MCP search still degrades to substring matching for those. The remainder are
  mostly components with no class-level JSDoc to extract — a docs task as much
  as an adapter one.
- ⚡ **Surface WCAG results from `applyPalette`.** `BrandPaletteConfig` omits the
  `checks` sink from `GenerateColorsConfig`, so the one agent-facing runtime
  theming API returns no accessibility signal — while hard `brand` pins are
  documented to possibly fail contrast, silently. Return a `ContrastReport`
  (the theme-builder already computes one separately via `generateThemes()`).
- **`ControlValueAccessor` bridge directive.** Form controls implement Signal
  Forms only; `formControlName` / `ngModel` don't bind, so an app still on
  `ReactiveFormsModule` cannot use them. No longer a ⚡: Signal Forms went
  stable in Angular 22, so this is a migration-path question for existing
  consumer code rather than a hedge against an experimental API. See Priority
  §6.
- ~~**Reconcile MCP versioning.**~~ Done — `uni-mcp` joined the fixed group
  (all four packages at 10.4.0) and the index is regenerated by
  `version-packages` on every release.

- ⚡ **Drop `builtAt` from the MCP index.** `packages/mcp/src/build/normalizer.ts:76`
  stamps `new Date().toISOString()` into a 900KB committed artefact. It is
  declared in the schema and **read nowhere**, and it guarantees a merge
  conflict whenever two branches regenerate the index — half of what makes
  every release merge conflict on that file.
- ⚡ **`remark-gfm` in the Storybook docs config.** Markdown tables render as
  raw pipes in every MDX page; `drawer.mdx`'s inputs table is unreadable today.
  One devDependency plus `mdxPluginOptions`.
- ⚡ **Show every scale in the token manifest.** `theme-manifest.component.ts`
  covers colors/spacing/radii/borders/shadows/thicknesses — not `motion`,
  `icons` or `backdrops`, so a themer cannot review them.
- **Fold `callout`/`tour` into `backdrops`.** They still carry their own
  `scrimColor`, with a duplicate hard-coded default in
  `cdk/position/anchor.ts:210` — the last places a scrim can drift after the
  dialog/drawer consolidation.
- **Retire the delivered design docs.** `prototypes/uni-drawer-and-sr-only-rfc.md`
  and `prototypes/uni-button-flexibility-cr.md` are fully answered but carry no
  resolved marker, so they still read as open work; the five prototype
  `SPEC.md` files say "Nothing here ships" for components that have shipped.
  Their *Open questions* sections are the parts worth keeping.

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
5. **Slot / content-projection metadata.** 0 of 84 indexed components describe what
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

1. **React package credibility.** Published at 10.4.0, at version parity with
   Angular, with **10 component directories against Angular's 66** and **one
   spec file**, plus third-party runtime deps (`framer-motion`, `@dnd-kit/*`,
   `use-ripple-hook`) that contradict the zero-deps policy. A consumer reading
   the version assumes parity. Fix, de-publish, or mark experimental — the
   current state undermines trust in the Angular package.
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
12. **Small dangling APIs.** Five names in `ComponentName` are unreachable —
    `footer` (declared *and* themed, never built) plus `textButton`,
    `buttonGroup`, `progressBar` and `select` (no theme entry, no
    `COMPONENT_NAME` provider), so a theme cannot dress them. Also `aria-live`
    regions absent for async state (table load completion, filter counts).
    See Priority §5.

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
