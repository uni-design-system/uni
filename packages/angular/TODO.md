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

## Phase 2 — Signals & API modernization

### 2.1 Purge legacy decorators (13 files)

Convert `@Input()` → `input()`, `@Output() EventEmitter` → `output()` in:

- [ ] `components/button/button.component.ts` (`symbolLeft`, `symbolRight`)
- [ ] `components/dialog/dialog.component.ts` (`defaultCloseButton`, `showing` EventEmitter)
- [ ] `components/dialog/dialog-buttons/dialog-buttons.component.ts`
- [ ] `components/tooltip/tooltip.component.ts` (`appendToBody`)
- [ ] `components/icon/icon.component.ts` / `components/icon-button/icon-button.component.ts`
- [ ] `components/badge/badge.component.ts`
- [ ] `components/layout/grid/grid.component.ts` + `grid-area/grid-area.component.ts`
- [ ] `components/notifications/alert|snackbar|confirmation-dialog`
- [ ] `cdk/notification/notification.component.ts`

### 2.2 Reactive styling (correctness + performance)

- [ ] Replace every `@HostBinding('class') get className()` getter with `protected readonly className = computed(() => css(...))` + `host: { '[class]': 'className()' }`. Getters re-run `css()` on **every CD cycle**; `computed()` memoizes and is zoneless-correct.
- [ ] Replace the "`effect()` writes plain string fields" pattern (`checkbox.component.ts` constructor effect → `checkboxLabel`/`checkboxInput`; `data-table.component.ts` → `tableClass` etc.) with `computed()` class signals. Plain-field mutation inside `effect()` is not tracked by templates and only renders by CD coincidence.
- [ ] Replace `@HostListener` with `host: { '(event)': ... }` metadata (`dialog.component.ts` BackdropClick/ClosingAnimation, ripple, etc.).
- [ ] Set `changeDetection: ChangeDetectionStrategy.OnPush` on **every** component (today only Menu has it). Consider a lint rule to enforce.
- [ ] Remove the manual `cdr.markForCheck()` in `menu.component.ts` — with signal inputs/outputs and OnPush it should be unnecessary; if state changes in `item.action()` callbacks aren't signal-backed, fix the state, not the CD.
- [ ] `dialog.component.ts`: `show` input + internal `linkedSignal` + `showing` EventEmitter is a hand-rolled two-way binding — replace with `show = model<boolean>(false)` for `[(show)]`.
- [ ] `button.component.ts` `symbolSize` computed crashes if the theme provides no `fontSize` (`parseFloat(undefined)` → NaN) — make it defensive.
- [ ] Drop redundant `standalone: true` (default in v21) and unused imports (`CommonModule` in dialog imports nothing it uses).
- [ ] Remove `$any()` casts in the 5 templates that use them — type event targets properly (small helper: `(input)="value.set(inputValue($event))"`).

### 2.3 Signal Forms polish

- [ ] Extract the repeated control boilerplate (`value`/`checked`, `disabled`, `touched`, `invalid`, `dirty`, `showError`, `markAsTouched`) into a shared base or helper — it's copy-pasted across all 6 form controls.
- [ ] Add `errors` display convention: components currently compute `showError()` but render no message — decide whether controls render validation messages (via `aria-describedby`, see Phase 1) or the host app does, and document it.
- [ ] Add `required` passthrough so `aria-required` can be set from field state.

---

## Phase 3 — Testing & CI (currently: tests exist, nothing runs them)

- [ ] **Pick and wire a runner.** Recommendation: **Vitest** via `@analogjs/vite-plugin-angular` (already a devDep; aligns with the Vite/Analog Storybook toolchain). Remove the unused `jest`/`@types/jest` devDeps. Add `"test"` script.
- [ ] Get the existing 31 specs green under the new runner.
- [ ] Cover the untested ~20 components — prioritize the form controls and DataTable (highest logic density: `currentSelectedIndex`, datasource, sorting, pagination).
- [ ] Add **interaction tests in stories** (`play` functions) for keyboard behavior built in Phase 1 — these double as living a11y documentation.
- [ ] Storybook test-runner + axe in CI (see 1.3).
- [ ] **ESLint** — there is no lint config anywhere. Add `angular-eslint` with:
  - `no-restricted-syntax` bans on `@Input`/`@Output`/`@HostBinding`/`@HostListener`
  - template a11y rules (`@angular-eslint/template/accessibility-*`)
  - enforce OnPush
- [ ] **CI workflow for PRs** (`.github/workflows/ci.yml`): build + lint + test + storybook-build. Today only `deploy-docs` and `release` exist — nothing gates a PR.
- [ ] Repo hygiene: remove `debug-storybook.log`; ensure `dist/`, `storybook-static/` are git-ignored.

---

## Phase 4 — Docs & DX for humans *and* AI agents

### 4.1 Fix what's actively misleading (AI agents will copy this verbatim)

- [ ] **README Getting Started is wrong**: it imports `ButtonComponent` (actual: `UniButtonComponent`) and uses `<uni-button text="...">` which matches **no selector** (actual: `button[uni-text-button]` with content projection, no `text` input). This is the first thing an AI agent reads — fix and add a compile-checked example.
- [ ] Audit every MDX usage snippet the same way (imports, selectors, input names).

### 4.2 Machine-readable surface (AI-agent readiness)

- [ ] Publish an **`llms.txt`** + per-component compact API reference (selector(s), inputs with types/defaults, outputs, content-projection slots, minimal example). Generate it from the compiler API (or `ng-packagr` metadata) so it can't drift.
- [ ] JSDoc every public input/output/method — flows into IDE intellisense, Storybook argTables, and the generated reference.
- [ ] **Decide the selector story.** Dual selectors (`uni-checkbox, Checkbox`; `button[uni-text-button], Button`) are novel but ambiguous for tooling and agents. Keep both if you want, but declare **one canonical form**, use it exclusively in all docs/stories, and document the alias as secondary.
- [ ] Ship a `CLAUDE.md` / `AGENTS.md` in the package root: conventions (signals-only, Emotion-only, no rxjs), canonical import/selector patterns, theming model, and "how to add a component" recipe.

### 4.3 Open-source table stakes

- [ ] `CONTRIBUTING.md` (setup, storybook, test, changeset flow), `CODE_OF_CONDUCT.md`, license file verified in `dist` output, issue/PR templates.
- [ ] `ACCESSIBILITY.md` (from Phase 1) linked in README.
- [ ] README: badges (npm, CI, coverage), feature matrix vs. the React package, theming quick-start, Signal Forms quick-start (this is the headline feature — show `form()` + `[field]` + `Checkbox` working together).
- [ ] Versioning/support policy: which Angular majors are supported, and the deprecation policy.

---

## Phase 5 — Architecture decisions to make deliberately

- [ ] **`@floating-ui/dom` is the package's only runtime dependency**, which conflicts with the stated "no 3rd-party deps" goal. Options: (a) accept and document it as the one blessed dep; (b) plan migration to native **CSS anchor positioning** (Chromium shipped; Firefox/Safari in progress) behind the current API. Recommend (a) now with (b) tracked for later.
- [ ] **Tooltip/Dropdown DOM creation via `Renderer2`** (`tooltip.component.ts` builds elements imperatively): consider template + `popover` (like Dropdown) so ARIA wiring, testing, and SSR are tractable.
- [ ] **SSR/hydration audit**: direct `document.body` access (tooltip `appendToBody`), `ElementRef.nativeElement` in constructors — gate behind `afterNextRender`/`isPlatformBrowser` or document the library as client-only.
- [ ] **Public API discipline**: `public-api.ts` wildcard-exports everything, including `BaseComponent` and internals. Curate exports; internals leaking into the public surface become breaking-change liabilities.
- [ ] `prototype/` directory: promote or delete before it ships in a release.

---

## Suggested sequencing

| Milestone | Contents | Why first |
|---|---|---|
| **M1** | Phase 3 runner+lint+CI, Phase 4.1 doc fixes | Everything after needs a safety net; wrong docs are actively harmful |
| **M2** | Phase 1 keyboard + ARIA on Menu/Dropdown/Dialog/Tooltip/form controls | Highest user impact, largest current gap |
| **M3** | Phase 2 decorator purge + reactive styling | Mechanical once lint rules enforce it |
| **M4** | Phase 1 remainder (table/paginator/progress), Phase 4.2 llms.txt + API reference | Polish + AI-agent readiness |
| **M5** | Phase 5 decisions, ACCESSIBILITY.md, v4.0 release | Ship it |
