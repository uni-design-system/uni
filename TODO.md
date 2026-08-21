# Uni — Roadmap

Consolidated lineup, composed 2026-07-23 (post-5.2.0). Supersedes the July port-parity
tracker (resolved items removed; live ones folded in below). Completed historical
audits: `packages/angular/TODO.md` (v4 audit) and `uni-theme-generation-plan.md`
(theme-generation PRD). Ordered within sections by leverage.

## Components — Tier 2 (common patterns, real build effort)

- [x] **Date picker + calendar** — shipped 2026-08-20 as `uni-calendar`,
      `uni-date-input`, `uni-time-input` and `uni-date-time-input` (grid
      keyboard nav, Intl locale parsing, range selection, availability
      markers, cdk datetime helpers). Deferred: range *input field*,
      dual-month pane, week numbers, natural-language parsing.
- [x] **Combobox / autocomplete** — shipped 2026-08-21 as `uni-combobox`: the
      form-bound, closed-set, single-select autocomplete (object `Options<T>`,
      `FormValueControl<T | null>`, draft-resolution commit rules, disabled
      options, local-by-default filtering with `filterLocally=false` async
      contract). `Option<T>` gained `description?`/`disabled?`;
      `ListboxNavigation` learned disabled-skip. Fast follows below.
- [ ] **Combobox fast follows** (deferred out of the 2026-08-21 port):
      1. ~~Extract the shared listbox popup styling~~ — done 2026-08-21 as
         `listboxPopupStyles()` in `components/forms/listbox-popup.ts`
         (components/, not cdk: theming imports cdk, and ListboxNavigation
         deliberately owns no styling); search-input, tag-input, time-input
         and combobox consume it, composing extras via the `css([base, …])`
         array form. Still open: the `announce()`/`srOnly` live-region idiom
         (hand-rolled in tag-input, time-input, date-input, calendar,
         combobox) — extract as a small `createAnnouncer()` cdk/a11y helper.
      2. Popup positioning migration — `popover="auto"` + CSS anchor
         positioning for all absolute-positioned listbox popups at once
         (they clip inside `overflow: hidden` ancestors today).
      3. Home/End caret-stealing revisit — APG's editable-combobox pattern
         reserves Home/End for the caret; change in `ListboxNavigation` for
         all consumers at once or not at all.
      4. `uni-select` / `multi-select-dropdown` adopt `Option.disabled`
         (native `<option disabled>` is a one-liner; MSD gets skipping free
         via the new `disabled` nav hook).
      5. `displayWith` — deliberately omitted; revisit only when a real
         consumer has a value-before-options case the self-healing field
         doesn't cover.
- [ ] **Stepper / wizard** — multi-step forms; pairs with Signal Forms.
- [ ] **List** — structured items (leading avatar/icon, primary/secondary text,
      trailing action); the "settings screen" primitive.
- [ ] **Number input** with increment/decrement steppers.
- [x] **Chips / tag input** — shipped in 8.0.0 as `uni-tag-input` (type-to-add,
      backspace-to-remove, listbox keyboard nav) alongside `uni-tag` v2; ARIA
      polish followed in the 8.1-era upgrade.
- [ ] **Password input** — visibility toggle on the input-box chrome.
- [ ] **OTP / pin input** — auth-flow staple for AI scaffolds.
- [ ] **Link** — theme-aware anchor (color/underline policy as tokens).
- [ ] **Spinner** — standalone documented loader (exists only inside button today).

## Components — Tier 3 (defer until asked for)

- [ ] Rating · timeline · carousel · bottom sheet · resizable panes ·
      color picker. (Time picker shipped 2026-08-20 as `uni-time-input`.)

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
- [x] ~~Input `typeFace` option casing → `typeface`~~ — renamed 2026-08-20 with a
      deprecated `typeFace` alias (remove next major).
- [x] ~~`icons: {}` empty in BaseTheme~~ — audited 2026-07-24: `uni-icon` reads it and
      every icon was invisible. `BaseIcons` now lives in core and merges into every
      `createTheme`; emitter + MCP teach icons-in-theme (never inline SVG).
- [x] ~~DarkTheme legacy `inverse-on-surface` key~~ — already gone (audited 2026-08-20:
      no references anywhere).
- [x] ~~notification-badge `offset` fallback~~ — fixed 2026-08-20 (`?? 0`; omitting it
      serialized `'undefinedpx'` and dropped the corner placement).
- [x] ~~multi-select-dropdown search debounce~~ — shipped with the 8.1-era dropdown
      upgrade (`debounceTime` input, 200 ms default).
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
- [x] ~~DTCG export tool~~ — shipped 2026-08-20 as `export-dtcg-tokens` (built-in
      theme → DTCG JSON via core's `emitDtcgTokens`).
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
