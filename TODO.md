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
- [x] **Combobox fast follows** (deferred out of the 2026-08-21 port; all
      resolved 2026-08-22 — 5 shipped, 1 declined by design):
      1. ~~Extract the shared listbox popup styling~~ — done 2026-08-21 as
         `listboxPopupStyles()` in `components/forms/listbox-popup.ts`
         (components/, not cdk: theming imports cdk, and ListboxNavigation
         deliberately owns no styling); search-input, tag-input, time-input
         and combobox consume it, composing extras via the `css([base, …])`
         array form. ~~The `announce()`/`srOnly` live-region idiom~~ — done
         2026-08-22 as `createAnnouncer()` in cdk/a11y; combobox, tag-input,
         time-input, date-input, calendar and tour share it. The audit
         corrected the list twice: multi-select-dropdown never had an
         announcer (it uses `srOnly` for static labels only), while tour did
         and was missing — with a plain signal, so its constant "Next
         available" was announced once and silently dropped on every later
         step. Styling stayed in the components; the CDK holds no emotion.
      2. ~~Popup positioning migration~~ — done 2026-08-22: all four listbox
         popups (search-input, tag-input, time-input, combobox) render in the
         top layer, anchored to their field, so they no longer clip inside
         `overflow: hidden` ancestors. `popover="manual"`, not `auto` — these
         controls already own dismissal, and `auto` light-dismisses on
         pointerdown outside the popup, i.e. on their own input. Gated on
         anchor-positioning support *together with* the top layer: Safari
         17–25 has popover but no anchors, and promoting there would strand
         the list a viewport height down the page, so it keeps the in-flow
         fallback. Plumbing in `components/forms/listbox-popup.ts`.
      3. ~~Home/End caret-stealing revisit~~ — done 2026-08-22. The audit
         found the "shared" contract had already drifted into four behaviors
         across five consumers (time-input never called `navigate`; combobox
         gated on the popup being open; search-input and tag-input claimed
         them unconditionally *and opened a closed list*; MSD claimed them
         with focus on checkboxes). Resolved with `homeEndNavigates` on
         `ListboxNavigationConfig`, default false: the caret wins in every
         text-field consumer, and MSD opts in because its focus rides the
         option checkboxes. Cheap because ArrowUp/ArrowDown already reach
         last/first and navigation wraps.
      4. ~~`uni-select` / `multi-select-dropdown` adopt `Option.disabled`~~ —
         done 2026-08-22, and `uni-multi-select` (the third `Options<T>`
         consumer) with them. Native `<option disabled>` for the select; the
         two multi-selects disable the checkbox, refuse a direct toggle, and
         leave disabled options out of `selectAll()` (not committable, so
         nothing commits one for the user; `deselectAll()` still clears all).
         MSD got arrow-skipping and Home/End-to-nearest-enabled free from the
         `disabled` nav hook.
      5. `displayWith` — deliberately omitted; revisit only when a real
         consumer has a value-before-options case the self-healing field
         doesn't cover.
      6. Free-text commits — Wellsourced requested them 2026-08-21 (first
         consumer report, v8.2/8.3). Resolved as docs: the "Allowing new
         values" MDX recipe (sentinel `Create "…"` option from `(query)`,
         resolved in `(selected)`), shipped as a patch. The closed-set SPEC
         decision stands; design `allowCustom` only if a real case survives
         the recipe.
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
- [x] ~~`snackbar` is the last overlay not in the top layer~~ — fixed
      2026-08-22. It was a `<dialog>` opened with `.show()` (the *non-modal*
      form, which never promotes), leaning on `zIndex: Z_INDEX.dialog`. Now a
      `popover="manual"` `<div>`: manual so a click elsewhere can't tear it
      away mid-read, and not `showModal()` since a transient message must not
      make the page inert. The element change from `<dialog>` drops the
      competing `open` attribute; `<div>`'s lack of dialog UA rules meant
      rebuilding the bottom-centred placement explicitly (`inset: auto` +
      `width: fit-content` + auto inline margins). Verified in-browser above a
      `z-index: 2147483647` overlay. Every overlay in the library is now
      top-layer.
- [x] ~~Overlay plumbing has diverged across three implementations~~ — done
      2026-08-22. `uni-dropdown` predated `cdk/overlay` and hand-rolled copies
      of `TRANSFORM_ORIGINS`, `restoreOverlayFocus`, `discreteOverlayTransition`,
      `setAnchorName` and `isToggleOpen`; it now uses all five, 35 lines
      shorter, with every `cdk/overlay` export finally having a consumer.
      Behaviour verified unchanged in-browser (100 ms linear, measured origin,
      focus restore). `discreteOverlayTransition` gained an optional timing
      function — which surfaced that the listbox popups, built to match the
      dropdown, were running `ease` against its `linear`; now identical.
      **The shared-factory question is closed: not worth building.** The
      overlays share mechanics but not lifecycles (trigger-toggle + focus
      restore vs hover-only vs focus-trapped scrim vs `@if`-rendered with focus
      in the field vs unanchored and timer-closed), so a single factory would
      need an option per component. The à-la-carte helpers are the right
      granularity — the defect was adoption, not design. The `auto` vs
      `manual` rule that was folklore is now documented at the top of
      `cdk/overlay/overlay.ts`. Closes the deferred "dropdown-internals
      adoption" from the popover-family port.
- [x] ~~Popup motion isn't themable~~ — done 2026-08-22 as a `motion` scale on
      `UniTheme`, a named primitive like `radii`/`shadows`: `MotionToken` pairs
      `duration`, `easing` and an optional `scale`, because they are one design
      decision. Two tokens with live consumers — `popup` (dropdown, menu,
      multi-select and the four listbox popups) and `panel` (popover) —
      deliberately not a third without one, having just learned that lesson
      from `TRANSFORM_ORIGINS`. `ThemeService.motion()` resolves with a
      fallback chain so JSON themes predating the scale still animate; the
      validator doesn't require it and `createTheme` fills it in, so nothing
      breaks. Defaults preserve every current timing exactly (verified in
      browser). `motionSafe` remains the floor.
- [ ] **Fold the remaining motion options into the `motion` scale** — `callout`
      still has `transitionMs`, and `expand`/`skeleton`/`alert` carry their own
      `duration`/`transitionSpeed` in seconds. They predate the scale and each
      invented a different unit and name. Migrating them is a breaking option
      change per component, so batch it with a major; `expand`'s duration also
      scales with content height, so it needs a token *plus* its curve rather
      than a straight swap.
- [ ] JSDoc coverage on public inputs/outputs — ongoing; feeds `llms.txt` and MCP
      summaries (empty where class JSDoc is missing).
- [ ] **uni-symbol → uni-icon migration** (rule established 2026-08-21, AGENTS.md
      Icons bullet; combobox converted same day). Composite components render
      glyphs via `uni-icon` theme tokens; `uni-symbol` stays only for app-facing
      arbitrary-name inputs. Remaining migrations, audited 2026-08-21:
      - Coverable today (BaseIcons has the glyph): search-input (`search`,
        `close`), select-input + multi-select-dropdown (`keyboard_arrow_down` →
        `chevronDown`), data-search (`close`), calendar + date-input
        (`chevron_left/right` → `chevronLeft/Right`, `calendar_month` →
        `calendar`), time-input (`schedule` → `clock`), dialog-header (`close`),
        menu-item `activeSymbol` (`check`), breadcrumb `separatorSymbol`
        (`chevron_right`), avatar `fallbackSymbol` (`person` → `profile`).
      - **Missing from BaseIcons** — add to `generate-icons.mjs` first:
        `arrowUp`/`arrowDown` (sort-header uses `arrow_upward`) and
        `chevronsLeft`/`chevronsRight` (paginator's `keyboard_double_arrow_*`).
      - Each migration renames its `*Symbol` theme option to `*Icon`
        (`IconName`-typed) — breaking per component, so batch for a major.
      - Known uni-icon gap vs symbols: no variable-font axes (fill/weight/
        grade) — themes like Wellsourced set `symbol: { weight: 200 }`, which
        has no icon equivalent short of regenerating the set at that weight.

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
- [ ] **Revive the hosted endpoint when a concrete consumer appears** — found
      dead 2026-08-21 (`x-render-routing: no-server`; free tier suspends on
      inactivity) and parked by decision: stdio via `npx` is canonical (repo
      `.mcp.json` added; version-locked answers). Revive (root `render.yaml`
      blueprint) for browser-based MCP clients (claude.ai connectors) or the
      `/themes/{id}.json` URL registry channel feeding Track 1 generative UI —
      and decide keepalive/monitoring at the same time so it can't die silently
      again.

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
