# Uni — Roadmap

Consolidated lineup, composed 2026-07-23 (post-5.2.0). Supersedes the July port-parity
tracker (resolved items removed; live ones folded in below). Completed historical
audits: `packages/angular/TODO.md` (v4 audit) and `uni-theme-generation-plan.md`
(theme-generation PRD). Ordered within sections by leverage.

## Components — Tier 2 (common patterns, real build effort)

- [ ] **Date picker + calendar** — the most-requested form control anywhere; the
      biggest single build (grid keyboard nav, locale; range selection later).
- [ ] **Combobox / autocomplete** — search-input now implements the ARIA combobox
      pattern with string suggestions (2026-07-24); remaining scope is a form-bound
      variant (object options, `FormValueControl`, non-search semantics).
- [ ] **Stepper / wizard** — multi-step forms; pairs with Signal Forms.
- [ ] **List** — structured items (leading avatar/icon, primary/secondary text,
      trailing action); the "settings screen" primitive.
- [ ] **Number input** with increment/decrement steppers.
- [ ] **Chips / tag input** — `uni-tag` is display-only; add the input variant
      (type-to-add, backspace-to-remove, keyboard nav).
- [ ] **Password input** — visibility toggle on the input-box chrome.
- [ ] **OTP / pin input** — auth-flow staple for AI scaffolds.
- [ ] **Link** — theme-aware anchor (color/underline policy as tokens).
- [ ] **Spinner** — standalone documented loader (exists only inside button today).

## Components — Tier 3 (defer until asked for)

- [ ] Rating · timeline · carousel · bottom sheet · time picker · resizable panes ·
      color picker.

## Future packages (deferred by decision — no 3rd-party deps)

- [ ] **`uni-barcode`** — pure TS encoder (Code 128 first: 107-pattern table,
      modulo-103 checksum, subset B/C switching; EAN-13/UPC-A next), SVG wrappers.
- [ ] **`uni-qrcode`** — ISO 18004 (Reed–Solomon over GF(256)); same architecture.
- [ ] App-level components (`pages/`, `print-preview`, `image-magnifier`).

## Token conformance & component housekeeping

- [x] ~~Hardcoded colors in checkbox / radio / toggle~~ — tokenized 2026-07-24
      (`boxColor`/`ringColor`/`fillColor`/`trackColor`/`knobColor` options; on-color
      pairs for check strokes; `disabled` tokens; themed knob shadow).
- [ ] **`footer`** — declared in `ComponentName` with theme options but unbuilt;
      build it (app-bar sibling) or remove the declaration.
- [ ] **Input `typeFace` option casing** → `typeface` (tooltip/button/tabs precedent),
      with a deprecated alias; do alongside the next input-box change.
- [x] ~~`icons: {}` empty in BaseTheme~~ — audited 2026-07-24: `uni-icon` reads it and
      every icon was invisible. `BaseIcons` now lives in core and merges into every
      `createTheme`; emitter + MCP teach icons-in-theme (never inline SVG).
- [ ] DarkTheme legacy `inverse-on-surface` key — remove once nothing references it.
- [ ] notification-badge `offset` fallback for themes that omit it.
- [ ] multi-select-dropdown search debounce (reuse debounce-input's signal pattern).
- [ ] JSDoc coverage on public inputs/outputs — ongoing; feeds `llms.txt` and MCP
      summaries (empty where class JSDoc is missing).

## Theme generation (PRD stragglers)

- [ ] **`npx @uni-design-system/uni-angular init`** fallback — schematic logic for
      Nx/custom-builder workspaces without the Angular CLI.
- [ ] Schematic e2e computed-style assertion (`ng serve` + browser check; today's e2e
      asserts build + file wiring only).
- [ ] Image input (stretch) — dominant-color extraction seeding the engine.
- [ ] Gradients / glassmorphism tokens (stretch) — Δh walks via `concepts/gradient`,
      glass via `concepts/masking`.

## Theme Builder (playground next phases)

- [ ] **Primitives editor** — define a border/radius/shadow/typeface primitive under
      an arbitrary token and point component options at it, live (makes the
      component-options superpower visible; color phase shipped).
- [ ] Typography & spacing editing phases.
- [ ] "Surprise me" seeded-random generation (playground-only by design).

## MCP server

- [x] ~~MDX guidelines adapter~~ — shipped 2026-07-24: Overview → whenToUse, optional
      Do/Don't/Accessibility bullet sections; 48/70 components covered.
- [x] ~~Author guidelines for skeleton MDX pages~~ — done 2026-07-24 with the
      canonical-structure sweep: all pages conform (AGENTS.md spec), empty Overviews
      written, form-control API tables retired; MCP carries whenToUse for 55/70 and
      a11y guidance for 36/70 (rest are subcomponents/directives).
- [ ] **DTCG export tool** — expose `emitDtcgTokens` (in core; playground already
      uses it) as an MCP tool.
- [ ] React bindings in the index — gated on uni-react parity.
- [ ] Semantic search over the index.

## React parity

- [ ] `uni-react` at ~8 components vs Angular's 50+. Deliberately deferred; revisit
      scope once the Angular surface stabilizes. MCP/React `init` parity rides on it.
- [ ] Prototype cdk modules (`breakpoint`, `clipboard`, `validation`, `image`,
      `save`, `scroll`) — port on demand.

## Process / quality

- [ ] **Story compile smoke-test in CI** — story templates are JIT-compiled at runtime,
      so neither `build-storybook` nor vitest validates them (the selector sweep proved
      it: only the ng-packagr AOT build catches template errors, and it doesn't see
      stories). A test-env pass that TestBed-compiles every story render would close
      the last unvalidated surface.
- [ ] **Chromatic / visual regression** — deliberately gated on component-library
      maturity (maintainer decision 2026-07-23); revisit once Tier 2 lands.
- [ ] Bundle-analysis CI check for the tree-shaking budget (engine ≈ 0 bytes for
      non-generating apps, PRD §7.1 — verified manually, not enforced).
- [ ] Remove deprecated HSL helpers (`uniColor`, `randomRangeValue`,
      `CategorySaturation`, `CategoryLightness`) — next major.
