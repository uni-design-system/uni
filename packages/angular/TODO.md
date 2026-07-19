# UNI Angular — Library Audit & Action Plan

> Goal: a "top-shelf" open-source Angular component library, equally consumable by
> AI coding agents and human developers. Audited 2026-07-18 against the
> `/angular-signals` standards (Angular v21+ Signals & Signal Forms), WCAG 2.2 AA,
> and open-source readiness criteria.

## Audit Summary

**What's already strong**

- ~85% of the library is on modern signal APIs (`input()`, `output()`, `model()`, `computed()`, `linkedSignal()`).
- Form controls (`Input`, `Checkbox`, `Radio`, `Toggle`, `SelectInput`, `MultiSelectDropdown`) implement `FormValueControl` / `FormCheckboxControl` — first-class Signal Forms integration, no CVA. This is a genuine differentiator.
- Native control flow (`@if` / `@for`) everywhere; zero `*ngIf`/`*ngFor` in templates.
- No rxjs, no HttpClient — clean signal-only reactivity per project conventions.
- Native platform primitives used well: `<dialog>` + `showModal()`, `popover="auto"` for dropdowns, native `<select>`.
- 51/51 components have stories + MDX docs; Storybook a11y addon installed.

**The three big gaps, in priority order**

1. **Accessibility is near-zero.** A repo-wide scan found ARIA usage in exactly one template and **zero keyboard event handlers in the entire library**. For a design system this is the headline blocker.
2. **Tests exist but cannot run.** 31 spec files, but no jest/vitest config, no `test` script, no lint config, and no CI workflow that builds or tests PRs.
3. **Legacy decorator remnants** in 13 files (`@Input`/`@Output`/`EventEmitter`), plus widespread `@HostBinding` getters that recompute Emotion CSS on every change-detection cycle.

---

## Phase 1 — Accessibility (WCAG 2.2 AA) 🚨 highest priority

### 1.1 Keyboard support ✅ (2026-07-18)

- [x] **Menu / Dropdown**: full menu pattern — arrows/`Home`/`End`/`Enter`/`Space`, first-letter typeahead, `ArrowDown`/`ArrowUp` on trigger opens onto first/last item, focus into menu on open, focus restored to trigger on close (handled generically by Dropdown).
- [x] **MultiSelectDropdown**: implemented as a **disclosure dialog** (`aria-haspopup="dialog"`) rather than menuitemcheckbox — the popover contains native focusables (search, checkboxes, Done) which Tab reaches natively; search input labelled.
- [x] **DataTable row interaction**: `useRowClick` rows get `tabindex="0"` + `Enter`/`Space` activation.
- [x] **ExpandToggle / Expand / ExpandArea**: `aria-expanded` + `aria-controls` wired (automatic inside ExpandArea via `Expand.regionId`).
- [x] **FileDropZone**: zone is `role="button"` + `tabindex="0"` + `Enter`/`Space` when no browse button is rendered (button provides the path otherwise).
- [x] **Tooltip**: shows on keyboard focus, hides on blur/`Escape`; hover-persistent over the bubble (WCAG 1.4.13); non-focusable triggers get `tabindex="0"`.

### 1.2 ARIA semantics per component ✅ (2026-07-18)

- [x] **Tooltip**: `role="tooltip"` + unique id, `aria-describedby` on the focusable trigger element (set while visible).
- [x] **Dialog**: `aria-labelledby` auto-wired when a DialogHeader is present, `ariaLabel` fallback input, `initialFocus` selector input. Bonus fix: native `cancel` (Escape) now routes through the animated close instead of desyncing state.
- [x] **Button**: `aria-busy` while loading; icons decorative (see Symbol/Icon below). Kept native `disabled`.
- [x] **Toggle**: `role="switch"` on the native checkbox input.
- [x] **Checkbox / Input / SelectInput / Radio**: `aria-invalid` from `showError()` everywhere; Checkbox `indeterminate` model + visual dash state; Radio gets `role="radiogroup"` + `aria-labelledby` + per-instance unique `name` default (was a colliding constant). **Deferred:** controls still render no error text, so `aria-describedby` association awaits the Phase 2.3 error-display decision.
- [x] **Input**: `label` input now applied as `aria-label` (was collected but never rendered). Visible `<label for>` rendering remains a design decision.
- [x] **SortHeader**: real `<button>` (keyboard for free) + `aria-sort` on the `<th>` via DataTable.
- [x] **DataTable**: `scope="col"`, `aria-busy` region + `role="status"` loading overlay, collapsed detail rows made `inert`. (`aria-selected` skipped: only valid on `role="grid"`; revisit if multi-select ships.)
- [x] **ProgressBar / ProgressGauge**: `role="progressbar"` + valuenow/min/max + `ariaLabel` input; SVGs decorative.
- [x] **Paginator**: `role="navigation"` landmark, page cells converted from divs to real buttons with `aria-current="page"`, labelled number inputs. Bonus fix: removed an `outline: none` that killed all focus indication.
- [x] **IconButton**: projected text now renders visually-hidden as the accessible name (previously silently dropped — every internal usage was nameless), plus optional `ariaLabel` override. Made required-by-convention rather than required-by-type to stay non-breaking; enforce via lint/axe in Phase 3.
- [x] **Symbol / Icon**: `aria-hidden="true"` at host level — decorative by default across the whole library.
- [x] **Alert / Snackbar**: `role="alert"` / `role="status"`; Snackbar already paused timers on hover/focus.
- [x] **NotificationBadge / Tag**: visually-hidden announcement text (+ `ariaLabel` input); Tag close button announces "Remove {label}". Also fixed invalid `role="label"` leftover on menu-item's Text.

### 1.3 Cross-cutting a11y

- [x] `prefers-reduced-motion`: global rule injected by ThemeService collapses all animations/transitions to one frame; `motionSafe()` helper also available in the cdk for opt-in wrapping.
- [x] Shared focus mixin: `ThemeService.focusRing(token?)`; applied to SortHeader, Paginator, menu items (themed, replacing hardcoded `#ccc`). Full per-component focus-ring audit continues alongside Phase 2 styling refactor.
- [x] New `cdk/a11y` module: `uniqueId()`, `visuallyHidden`, `FOCUSABLE_SELECTOR`, `resolveFocusTarget()`, `motionSafe()` — exported publicly.
- [ ] Contrast: add an automated check that theme token pairs (`colorPair`) meet 4.5:1; document which built-in variants pass.
- [ ] Turn on `@storybook/addon-a11y` **as a CI gate** (axe via Storybook test-runner), not just a panel. (→ do with Phase 3 CI.)
- [x] `ACCESSIBILITY.md` written: conformance target, per-component keyboard maps and contracts, known gaps.

---

## Phase 2 — Signals & API modernization ✅ (2026-07-19)

### 2.1 Purge legacy decorators ✅

- [x] Zero `@Input`/`@Output`/`EventEmitter`/`@HostBinding`/`@HostListener` left in the library; the ESLint bans are now **errors**, so they can't come back.
- [x] Behavior notes from the purge: Icon's `name` is now `input.required`; IconButton shows the spinner icon while `loading` (previously it hid both icons); GridArea's `area` is `input.required`.

### 2.2 Reactive styling (correctness + performance) ✅

- [x] All ~17 `@HostBinding('class')` getters → memoized `computed()` + `host: { '[class]': ... }` (Box's ~50-signal mega-getter included; subclass class-merging via distinct binding names preserved).
- [x] All effect-written class fields → `computed()` (checkbox, toggle, radio, data-table ×7 fields, paginator, multi-select, multi-select-dropdown). Shared metric locals extracted into small private `computed()`s. Dead `displayedColumns` signal in data-table removed.
- [x] `@HostListener` → host metadata (dialog, ripple).
- [x] `ChangeDetectionStrategy.OnPush` on **every** component (~45 files); `prefer-on-push` lint rule now **error**.
- [x] `menu.component.ts` `cdr.markForCheck()` removed.
- [x] Dialog: `show` is now `model<boolean>` → `[(show)]` works; `showing` output retained (emits after open / after close-animation). Bonus: `open()`/`close()` are now idempotent (double `showModal()` used to throw).
- [x] `symbolSize` defensive against themes without `fontSize`.
- [x] `standalone: true` dropped from 42 files.
- [x] `$any()` purged from all 5 templates — handlers now take the `Event` and narrow in TS.

### 2.3 Signal Forms polish ✅ (decisions recorded)

- [x] **Decision — keep per-control state fields explicit.** The `value/checked, disabled, touched, invalid, dirty` block is the `FormValueControl`/`FormCheckboxControl` interface contract; a shared base class would force multiple-inheritance gymnastics (several controls already extend `BaseComponent`) and hide the contract from readers/AI agents. Explicit wins.
- [x] **Decision — error messages are the app's job.** Controls expose the state (`aria-invalid` via `showError()`) and a new `ariaDescribedBy` input on all six controls so apps can associate their own message element. Documented in ACCESSIBILITY.md.
- [x] `required` input added to all six controls (synced by the `[field]` directive from `required()` validators) and exposed as `aria-required`.

---

## Phase 3 — Testing & CI ✅ core done (2026-07-19)

- [x] **Runner: Vitest** (zoneless — no zone.js; matches how the library runs in apps) via `@analogjs/vite-plugin-angular`. `pnpm test` / `test:watch`; jest deps removed; jsdom stubs for the Popover/`<dialog>` APIs live in `src/test-setup.ts`. **Note:** `vitest.config.ts` carries a documented workaround for an Analog 2.5.x bug under Vite 8 (its vitest sourcemap pass parses uncompiled `.ts` as JS) — keep spec files decorator-free; revisit when Analog ships a fix.
- [x] Existing 31 spec files green — most were stale scaffolds importing pre-rename class names (`ButtonComponent` vs `UniButtonComponent`) and were rewritten against the real API with behavioral assertions on the Phase 1 a11y contracts (aria-busy, aria-expanded wiring, menuitem roles, dialog labelling, Escape-cancel routing).
- [x] New specs for previously untested controls: Checkbox (indeterminate + aria-invalid gating), Toggle (switch role), Radio (radiogroup, per-instance name uniqueness), Input/Select (label exposure, value mapping), ProgressBar (progressbar contract), NotificationBadge (SR announcement). **48 → 69 tests, 38 files, all green.**
- [ ] Remaining coverage: DataTable/SortHeader/Paginator against a `UniDatasource` fixture; MultiSelectDropdown filtering/selection.
- [ ] **Interaction tests in stories** (`play` functions) for the Phase 1 keyboard behavior — jsdom can't drive popovers/dialogs; this is where real keyboard coverage belongs.
- [ ] Storybook test-runner + axe as a CI gate — deferred: needs `@storybook/test-runner` + Playwright wiring against `storybook-static`; do as its own PR.
- [x] **ESLint** (`eslint.config.js`, flat): angular-eslint recommended + **template a11y rules as errors** (already caught two real gaps: Popover's keyboard-invisible trigger, an unlabelled demo input), legacy-decorator bans via `no-restricted-syntax` as **warnings** (~90; flip to errors as Phase 2 lands), `prefer-on-push` warning. Output renames that would be breaking (`change`, `close`, `onFileDropped`) are suppressed inline with `TODO(v4)` markers.
- [x] **CI workflow** `.github/workflows/ci.yml`: PRs + main → turbo build, lint, test, Angular storybook build; `test`/`lint` tasks registered in turbo.json.
- [x] Repo hygiene: `debug-storybook.log` deleted; `dist/` and `storybook-static/` were already git-ignored.

---

## Phase 4 — Docs & DX for humans *and* AI agents ✅ core done (2026-07-19)

### 4.1 Fix what's actively misleading ✅

- [x] **README rewritten** with compile-checked examples: real class names, real selectors (`button[uni-text-button]` + content projection), theming quick-start, Signal Forms quick-start.
- [x] MDX audited programmatically (imports + tags checked against real exports/selectors). Findings fixed: `MultiSelectComponent` → `UniMultiSelectComponent`; **fabricated ControlValueAccessor documentation removed** from checkbox/toggle/radio (the controls never implemented `writeValue`/`registerOnChange`); radio's broken Reactive Forms example replaced with a working Signal Forms `form()` + `[field]` example.
- [x] Verified against the shipped v21 API: `FieldTree` subfields are **direct property access** (`form.username`), not `.fields.username` — note: the repo's `/angular-signals` skill file uses the `.fields.` form and should be updated.

### 4.2 Machine-readable surface (AI-agent readiness) ✅

- [x] **`llms.txt` generated from source** by `scripts/generate-api.mjs` (`pnpm docs:api`): selector, inputs with types/defaults, two-way models, outputs, JSDoc summaries for 58 components/directives, plus inheritance notes (BaseComponent variant/size, Box layout props). Regenerate on API changes; CI can diff for drift.
- [ ] JSDoc every public input/output — ongoing; the generator already surfaces what exists (a11y-relevant inputs are documented). Grow coverage opportunistically.
- [x] **Selector decision:** canonical = `uni-*`-prefixed form; short/PascalCase are documented secondaries. Recorded in README, llms.txt header, and AGENTS.md.
- [x] **`AGENTS.md`** shipped: hard rules (lint-enforced), architecture conventions, form-control contract, a11y requirements, add-a-component checklist, commands.

### 4.3 Open-source table stakes ✅ (one open decision)

- [x] `CONTRIBUTING.md` extended (test/lint gates, AGENTS/ACCESSIBILITY pointers, a11y-is-a-bug policy); `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1); issue templates (bug / accessibility / feature) + PR template with quality checklist.
- [x] ACCESSIBILITY.md linked from README.
- [x] README: npm + CI badges, theming and Signal Forms quick-starts, selector table, versioning/support policy (one Angular major per package major, 6-month fix window).
- [x] **LICENSE: MIT** (maintainer decision, 2026-07-19). `/LICENSE` at root + copies in all three packages, `"license": "MIT"` in all package.jsons, verified present in the ng-packagr `dist` output.

---

## Phase 5 — Architecture decisions ✅ decided & executed (2026-07-19)

- [x] **`@floating-ui/dom` REMOVED** (maintainer decision). Replaced with native **CSS Anchor Positioning** (Baseline 2026: Chrome 125+, Firefox 132+, Safari 18.2+) via new cdk helpers `anchorStyles`/`anchorArrowStyles`/`newAnchorName` + a library-owned `Placement` type. The browser now tracks anchors natively — Dropdown's `autoUpdate` scroll/resize plumbing is deleted. **Zero runtime dependencies.** Known degradation: browsers without `@position-try` (Safari < 26, Firefox < 147) position correctly but don't auto-flip at viewport edges; heals as browsers update. Dropdown's `offset` input type changed from floating-ui's `OffsetOptions` to the structurally-compatible cdk `AnchorOffset`.
- [x] **Tooltip rebuilt declaratively**: the bubble is a template `popover="manual"` span in the top layer — no more `Renderer2` element building, `aria-describedby` wired once (bubble always in DOM), hoverable/Escape/focus contract preserved, spec asserts it. `appendToBody` is a deprecated no-op (top layer makes it meaningless); fixed a latent bug where the `hoverDelay` input was ignored in favor of an internal signal. The arrow is static per placement (won't follow a `@position-try` flip — cosmetic only).
- [x] **Popover kept as a first-class component** (maintainer decision) and converted: native `popover` (light-dismiss = its old `autoClose` window-listener), CSS anchors, bordered arrow, plus new `aria-expanded`/`aria-controls` wiring. `BodyRenderDirective` no longer used internally (still exported).
- [x] **SSR posture decided: client-only**, documented in README + AGENTS.md. Pre-render DOM access is gated behind `afterNextRender` where it exists.
- [x] **Public API verified curated**: barrels do not export `BaseComponent`, demo/story components, or cdk internals; commented-out future components (`barcode`, `qrcode`, `pages`) stay unshipped. cdk a11y + positioning helpers are deliberate public API.
- [x] `prototype/` — removed by maintainer before this phase; moot.

---

## Suggested sequencing

| Milestone | Contents | Why first |
|---|---|---|
| **M1** | Phase 3 runner+lint+CI, Phase 4.1 doc fixes | Everything after needs a safety net; wrong docs are actively harmful |
| **M2** | Phase 1 keyboard + ARIA on Menu/Dropdown/Dialog/Tooltip/form controls | Highest user impact, largest current gap |
| **M3** | Phase 2 decorator purge + reactive styling | Mechanical once lint rules enforce it |
| **M4** | Phase 1 remainder (table/paginator/progress), Phase 4.2 llms.txt + API reference | Polish + AI-agent readiness |
| **M5** | Phase 5 decisions, ACCESSIBILITY.md, v4.0 release | Ship it |
