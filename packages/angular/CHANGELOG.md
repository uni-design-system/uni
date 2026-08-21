# @uni-design-system/uni-angular

## 8.3.0

### Minor Changes

- [`eb8b7ae`](https://github.com/uni-design-system/uni/commit/eb8b7aebd900e647a8b35da791fce88a8c9a1217) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-combobox` — the form-bound, closed-set, single-select autocomplete. `FormValueControl<T | null>` over the cdk's object `Options<T>`, so it drops into Signal Forms via `[field]`; minimum usage is `<uni-combobox label="State" [options]="states" [(value)]="state" />`. Typing filters, it never selects: the draft commits on an active option, a unique exact label match, or (Enter only) a filter narrowed to one enabled option; anything else reverts and emits `(rejected)`. The value contract is identical to `uni-select` (`T | null`, `compareWith`), so swapping one for the other as a list grows is a template-only change. Filtering is local by default; `[filterLocally]="false"` renders `options` verbatim and the app narrows them from the debounced `(query)` output — the async/server-side story. Glyphs are theme icon primitives (`toggleIcon`/`clearIcon`/`selectedIcon`) rendered by `uni-icon`.

  Supporting cdk changes, both non-breaking:
  - `Option<T>` gains optional `description` (secondary line, read as part of the option's name) and `disabled` (visible and announced, not committable).
  - `ListboxNavigation` accepts a `disabled?: (index) => boolean` config hook — arrows skip disabled options, `Home`/`End` land on the nearest enabled one, an all-disabled list never activates. Existing consumers pass nothing and behave identically.

- [`eb8b7ae`](https://github.com/uni-design-system/uni/commit/eb8b7aebd900e647a8b35da791fce88a8c9a1217) Thanks [@gaenglish](https://github.com/gaenglish)! - Listbox popups (`uni-search-input`, `uni-tag-input`, `uni-time-input`, `uni-combobox`): the active/hover option fill is now the themable `activeColor` option (default `'primary-container'`, on-color derived) instead of a hardcoded token pair. Set it when your theme maps `primary-container` and `primary-surface` to the same color — the keyboard highlight is otherwise invisible; a canvas/hover tint like the one your menus use is usually right (`searchInput: { options: { activeColor: 'tertiary-surface' } }`, and likewise `tagInput`/`timeInput`/`combobox`). The base theme carries the default explicitly so the option is discoverable in each component's Theme options table.

  The four popups now share one style source, the exported `listboxPopupStyles(theme, options, { maxHeight? })` helper (`UniListboxPopupOptions`), so their surface trio and highlight can no longer drift apart. Rendering is unchanged under existing themes; the active row's text color now derives from `listColor`'s on-pair rather than assuming `on-primary-surface`.

- [`6f87212`](https://github.com/uni-design-system/uni/commit/6f87212da2ed421a8a4f2e57047ebcba485c0fd3) Thanks [@gaenglish](https://github.com/gaenglish)! - Popover v2, `uni-callout`, and `uni-tour` — the coach-mark family from the popover prototype, plus shared overlay primitives in the cdk.

  **`uni-popover` v2 (upgrade in place).** Everything v1 shipped keeps its exact behavior (`placement`, `autoClose`, the three methods — `togglePopover`'s event is now optional — and both slots), and the chrome now resolves from a real `popover` theme entry whose defaults match the old hardcoded look. New: a two-way `open` model; `mode="tooltip"` (hover/focus timers, `role="tooltip"` + `aria-describedby`, WCAG 1.4.13 hoverable/dismissable, dev warning on focusable content — `uni-tooltip` remains for the wrap-content case); a detached `anchor` input (element or id, resolved at open) so the panel can hug a field while the trigger keeps the disclosure ARIA — and with no trigger content, no element claims `aria-expanded` it doesn't deserve; structured anatomy (`header` + `closable` ✕, `[popover-header]`/`[popover-footer]` slots that collapse when empty); `arrow`, `maxWidth` (theme default `38ch` — the one visible change for long unwrapped content; set the theme's `maxWidth: 'none'` to opt out), `openDelay`/`closeDelay`, and `opened`/`closed` outputs. Focus follows the APG disclosure pattern: stays on the trigger unless the panel marks `[autofocus]`, returns on close.

  **`uni-callout` (new).** An anchored coach mark that dims the page and cuts a spotlight hole around its target. Every scrim piece is CSS-anchor-positioned, so the hole tracks scroll/resize/layout with zero listeners, and the spotlit element stays genuinely clickable through it (`targetInteractive=false` covers it instead). Non-modal `role="dialog"` with the "duet" focus loop — Tab cycles the panel's controls plus the interactive target — and focus restore that respects a user who moved into the target. `backdrop: 'spotlight' | 'dim' | 'none'`, `dismissible`, `dismissOnBackdrop` (otherwise backdrop clicks pulse the panel), and a `dismissed` output with `reason` (`close-button`/`escape`/`backdrop`/`programmatic`) plus `key` — the storage-free "don't show again" hooks. Retargets in place when `target` changes while open, which is what the tour rides.

  **`uni-tour` (new).** A thin sequencer over one callout: `steps` with per-step placement/backdrop/interactivity, a two-way deep-linkable `active` model, Back/Next/Done with dots-or-fraction progress, and `advanceOn` interaction gates — clicks auto-advance, anything else unlocks Next and announces it through one polite live region. Missing-target steps are skipped in the direction of travel with a dev warning. Escape/✕ (named by `skipLabel`) skip and report the step.

  **cdk.** New `overlay` module (`TRANSFORM_ORIGINS`, `setAnchorName`/`clearAnchorName`, `resolveElement` — `''` is unset, `isToggleOpen`, `discreteOverlayTransition`, `restoreOverlayFocus`, `focusableElements`) extracted from the dropdown's plumbing (dropdown's public API unchanged); `spotlightStyles(anchor, { pad, ringWidth, scrimColor })` beside `anchorStyles`, returning the window/strips/cover pieces as pure `calc(anchor(...))` style objects.

  **Arrow fix.** `anchorArrowStyles` now clips the rotated-square arrow to its outer half with a per-placement `clip-path` cut exactly on the panel-edge diagonal: the two border strokes previously ran the full square and visibly cut into the panel surface; they now terminate precisely at the panel edge, and the panel's own border line — which sits just outside that edge — falls inside the kept half, so the arrow background covers it and the base reads as an opening in the border. Tooltip, popover, and callout inherit the fix with no call-site changes.

## 8.2.0

### Minor Changes

- [`57a8c4c`](https://github.com/uni-design-system/uni/commit/57a8c4c73c852a6b14c2e2916cad9bd0a1566787) Thanks [@gaenglish](https://github.com/gaenglish)! - Input options: `typeFace` → `typeface`, matching the tooltip/button/tabs casing. The base theme now writes `typeface`, and the input box reads the new key with the old one as a deprecated fallback, so themes that still set `typeFace` render unchanged. The `typeFace` key is deprecated and will be removed in the next major.

- [`96113ee`](https://github.com/uni-design-system/uni/commit/96113eecc54f6d9a7dcf4d97264a4ee4f4367410) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-select`: `compareWith` input for object values.

  The select matched `value` against option values with `===`, so an object value that was structurally but not referentially equal — a saved record matched against options from a fresh fetch — never matched, and the native select silently rendered the first option (or the placeholder) instead of the preselection. The new `compareWith` input, called as `compareWith(optionValue, value)` and defaulting to reference equality, lets object-valued selects pass a key comparison like `(a, b) => a?.id === b?.id`. Primitive values were and remain unaffected.

### Patch Changes

- [`57a8c4c`](https://github.com/uni-design-system/uni/commit/57a8c4c73c852a6b14c2e2916cad9bd0a1566787) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-notification-badge`: a theme that omits the `offset` option no longer breaks badge positioning — the position values serialized as the invalid length `'undefinedpx'` and the badge lost its corner placement. Missing `offset` now falls back to `0`.

- [`92e5d5e`](https://github.com/uni-design-system/uni/commit/92e5d5e88787bca796325313e2c07b4f7351afcb) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-calendar` / `uni-date-input`: a bound `''` now counts as "no value".

  An empty string — the only typeable empty for a string-typed model, and the natural "no value yet" in consumer code — slipped past the month path's nullish (`??`) guards into the grid math: `viewMonth` became `''`, the month heading threw `RangeError: Invalid time value` from `Intl.format` on every change-detection pass, and the grid rendered zero weeks. This hit on first render (the popup content projects eagerly), not just on open. The guards are now falsy, matching how `displayText`, `splitDateTime`, and the rest of the datetime path already treat `''`, so a calendar or date-input bound to `''` renders the current month exactly like `undefined`. `uni-time-input` and `uni-date-time-input` were already safe. Consumers no longer need to normalize `''` to `undefined` before binding — and note the `value` models were always typed `UniDate | undefined`, so no `$any()` cast is needed for a `string | undefined` draft signal.

- [`e706e38`](https://github.com/uni-design-system/uni/commit/e706e3887f47d8821cc1652410ad37a43d52a428) Thanks [@gaenglish](https://github.com/gaenglish)! - Ship `CHANGELOG.md` in the published packages. The release notes existed only in the repo; an installed package carried no record of what changed, so upgrade questions couldn't be answered from `node_modules`. uni-angular copies it into the ng-packagr `dist` via `assets`; the rest add it to `files`.

- [`96113ee`](https://github.com/uni-design-system/uni/commit/96113eecc54f6d9a7dcf4d97264a4ee4f4367410) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-menu`, `uni-multi-select`, `uni-data-table`: stop tracking loop collections by identity (NG0956).

  `uni-menu` items, `uni-multi-select` options, and `uni-data-table` records tracked by object identity, so a consumer rebuilding the array each change-detection pass — the natural way to write `[menuItems]="[...]"` or re-fetch table rows — recreated every DOM node and tripped NG0956. They now track by `$index` (none of these collections carries a stable key: menu items may be templates or dividers, option values may be objects, records are arbitrary), and data-table columns track by their unique `columnDef`. Consumers no longer need to memoize a stable array; DOM nodes — including a focused menu item — survive a rebuild.

## 8.1.0

### Minor Changes

- [`71bc74c`](https://github.com/uni-design-system/uni/commit/71bc74c0441d4170dc38312967610eac46788326) Thanks [@gaenglish](https://github.com/gaenglish)! - Calendar, date & time entry: `uni-calendar`, `uni-date-input`, `uni-time-input` and `uni-date-time-input`, plus a pure datetime helper layer in the cdk.

  The most-requested form control family anywhere, built native-platform-first with zero runtime dependencies: `Intl` does all formatting and parsing (no date library), the popup rides the native popover top layer with CSS anchor positioning, and every day in the grid is a real `<button>`.
  - **Values are plain ISO strings, never `Date`s** — `UniDate` (`'YYYY-MM-DD'`), `UniTime` (`'HH:mm'`, always 24-hour), `UniDateTime` (`'YYYY-MM-DDTHH:mm'`), `UniDateRange` (`{ start, end }`). A `Date` is a timestamp with a timezone problem; a calendar date is a label on a wall calendar. Strings are timezone-free, JSON-serializable and sortable with `<`, and `[value]="'2026-08-20'"` is a complete, correct binding.
  - **`uni-calendar`** is an inline month grid and a form control in its own right: single and range modes in one component (the value shape switches with `mode`), availability **markers** with screen-reader labels, `minDate`/`maxDate` fences, `disabledDates` as a list or predicate, and a two-way `month` model so an app can drive "jump to June". One tab stop with a roving-tabindex `role="grid"`; the full APG keyboard map (arrows, week `Home`/`End`, `PageUp`/`PageDown` with `Shift` for years) crosses month edges, skips disabled days directionally, and stops at fences without wrapping. Range selection paints a live preview band, swaps a backwards commit instead of erroring, and narrates every step through a `role="status"` region.
  - **`uni-date-input`** is free-typed date entry — no input mask (masks fight paste, IMEs and screen-reader echo). The parser accepts ISO, locale-numeric text with the digit order read from `Intl.DateTimeFormat(locale).formatToParts()`, and the locale's own month names; a missing year resolves to the next occurrence and two-digit years are refused rather than guessed. Unreadable, fenced or unavailable text **stays in the field**, flagged, with a `rejected` event. The popup is the same `uni-calendar`, hosted in a `role="dialog"` popover via the shared `uni-dropdown`; `↑`/`↓` on a committed value step ±1 day.
  - **`uni-time-input`** is a combobox over time slots — byte-for-byte the search-input/tag-input listbox contract via the CDK's `ListboxNavigation`. `9` → 09:00, `930` → 09:30, `3p` → 15:00, and a bare `3` leans PM in a 12-hour field (the bias yields when `minTime`/`maxTime` say otherwise). `slots` pins the choices for scheduling, refusing a typed `5pm` as `'unavailable'`; `↑`/`↓` on a committed value step ±`minuteStep`.
  - **`uni-date-time-input`** seats both parts in one `uni-input-box` chrome under one `role="group"` label, emitting one combined value only when both parts are set. `slotsFor` is the scheduling flow in one attribute: the time part stays disabled until a day is chosen, then offers exactly that day's slots, and changing the day clears a slot that no longer exists. The parts gained an `embedded` input so the composer renders one shared box instead of nested chrome.
  - **cdk `datetime` module** (public export): the string-math and `Intl` layer — `addDays`/`addMonths`/`buildMonthGrid`/`parseDateText`/`parseTimeText`/`timeSlots`/`localeWeekStart` and friends — pure functions, unit-tested hard, usable by apps directly.
  - **uni-core**: `'calendar'`, `'dateInput'`, `'timeInput'`, `'dateTimeInput'` join `ComponentName` with base-theme entries (day geometry per size token, `dayBorderRadius: 'xxs'` for the square look, toggle glyphs, popup/list chrome). Selection, range and today colours are deliberately not options — they are the `primary` role pair, so themes restyle them by restyling the palette.
  - **Naming note:** the fences are `minDate`/`maxDate`/`minTime`/`maxTime`/`minDateTime`/`maxDateTime` rather than the platform's `min`/`max`, because Signal Forms' `FormUiControl` reserves `min`/`max` as numeric signals on form controls.

- [`1a6b382`](https://github.com/uni-design-system/uni/commit/1a6b38273e5c6daaea6355e1ba8cf01d7e851100) Thanks [@gaenglish](https://github.com/gaenglish)! - Themable focus chrome: a shared `focusRing` primitive for every control, plus `focusBorder`/`focusShadow`/`focusColor` options for input boxes.

  **Shared focus ring.** A theme can now restyle the keyboard-focus indicator across the whole library by defining `focusRing` **border** and/or **shadow** primitives: `ThemeService.focusRing()` (and the new selector-less `focusRingStyle()`) replaces its default 2px outline with that border — drawn as an outline hugging the control — plus the ring shadow. A `focusRing` **thickness** primitive sets the ring's outline offset (negative values overlay the control's resting border, reading as a border-color change). Checkbox, radio, toggle and slider now route their hand-rolled focus styles through the shared helper (calendar days and tag chips already did), so one primitive trio gives every control the same focus language. Themes without the primitives render exactly as before.

  **uni-core:** `Thicknesses` is now an open record like `Borders`/`Shadows` (extra named primitives allowed), and `createTheme` accepts a sparse `thicknesses` override merged over the base scale.

  **Also in this release:**
  - Radio and toggle scope their transitions (border/background/transform) instead of `all`, so the focus ring's outline and shadow apply instantly — `transition: all` interpolated the outline from a stale color, flashing a dark ring before the themed ring color landed.
  - The radio's dot grow/retract animation is a token — `radio.options.transitionSpeed` (seconds, default 0.3 preserving the current feel; 0 switches instantly).
  - The checkbox focus ring rounds proportionally again (box radius plus its gap) and the gap itself is a new `checkbox.options.focusRingGap` option; a `focusRingStyle` call's explicit gap wins over the theme's `focusRing` thickness, then the branch defaults.

  The `input` component options could previously restyle focus only through `focusOutline`/`focusOutlineOffset`. The new optional trio mirrors the error-state trio (`errorBorder`/`errorShadow`/`errorColor`) and applies while any projected control has focus: `focusBorder` swaps the border primitive, `focusShadow` draws a ring (e.g. a soft `0 0 0 3px` spread), and `focusColor` swaps the background. All three default to `undefined`, so existing themes render exactly as before, and they yield to the error state so a flagged field stays visibly flagged while being corrected.

  The Wellsourced showcase theme now defines the `focusRing` pair for its app's `.search-input:focus` look — an ochre (`secondary`) 1px border with a 10% ring of the same hue, tinted per palette in light and dark — so text fields (which rest on a canvas tint and snap to the clean surface on focus), checkboxes, radios, toggles, sliders, calendar days and tag chips all share one focus treatment.

## 8.0.0

### Major Changes

- [`760b761`](https://github.com/uni-design-system/uni/commit/760b761ad77533e7e01f7a56731f74e470bbd948) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-tag` v2: themable, opt-in removal, two style axes

  v1 was a single hardcoded look with the palette welded into its template, an
  unconditional remove button, and no theme entry — a filter chip, a status pill
  and a recipient token all rendered identically. v2 makes the chip a real themed
  component and the building block `uni-tag-input` composes.

  **Breaking (uni-angular)**
  - **`(close)` is now `(removed)`.** The old name shadowed the native `close`
    event and needed an eslint suppression to compile.
  - **The remove button is opt-in** — set `[removable]="true"`. Previously every
    tag, including a plain category label, shipped a "Remove …" button into the
    accessibility tree.
  - Codemod: rename `(close)` → `(removed)` and add `[removable]="true"` wherever
    a `(close)` handler exists.

  **Fixed**
  - **A falsy value can now be removed.** `handleClose` guarded with `if (v)`, so
    a tag keyed `''` or `0` silently could not be dismissed. Every defined value
    emits, and a tag with no value emits `undefined`.
  - The remove control now sizes from the chip instead of the icon-button's own
    `sm` size — it was 22px inside a 24px chip, and taller than an `sm` chip
    entirely.

  **New**
  - **Two orthogonal style axes**: `variant` picks the colour role, `tone` picks
    the archetype (`soft` / `solid` / `outline`). Both resolve from the new `tag`
    theme entry, with tones as nested `&.tone-*` selectors inside each variant so
    a theme author restyles both axes in one place.
  - **`'tag'` joins core's `ComponentName`**, with a `TagTone` type and a full
    theme entry (`options` for radius/typeface/gap/symbols, `variants` per colour
    role, `sizes` carrying geometry only).
  - **`interactive`** turns the chip body into a `<button>` with `selected` mapped
    to `aria-pressed`, keeping the remove control a sibling — nesting them would
    be invalid HTML and would strand the inner control for keyboard users.
  - **Lead slot**: `avatarSrc`, `avatarName` (initials fallback), `iconName`,
    `symbolName` and `dot` convenience inputs, plus a `[tag-lead]` slot for
    anything richer. Lead elements size from the chip height, and all are
    `aria-hidden` so the chip's text stays its accessible name.
  - **Glyphs are theme icon primitives, not Material ligatures.** The remove and
    selected affordances resolve through the new `removeIcon` / `selectedIcon`
    theme options (defaulting to the built-in `close` and `check`), so they mask
    `currentColor`, recolour with the chip's tone, and can be swapped per theme.
    They also contribute no text to the DOM, which a ligature does — one less way
    for an accessible name to be polluted. `symbolName` remains as the escape
    hatch for glyphs the theme's icon set doesn't carry.
  - **`invalid`** sets `aria-invalid` and a dashed underline, so the state does
    not rely on colour alone (WCAG 1.4.1); `disabled`, `maxWidth` truncation with
    a `title`, and `removeLabel` for overriding the remove button's name.
  - The component ships with 21 specs, having previously had none.

- [`6a4c7da`](https://github.com/uni-design-system/uni/commit/6a4c7da4c7c3f5758d8c66d1be714319c983e39e) Thanks [@gaenglish](https://github.com/gaenglish)! - `ThemeService`: validated writes, runtime theme registration, live options

  The theme registry was bootstrap-frozen and nothing validated theme writes —
  and a brand theme applied via `applyPalette` never appeared in
  `uni-theme-switch`, leaving the select on a bogus value with no way back.

  **Breaking**
  - `ThemeService.theme` is now a **readonly signal**. Direct `theme.set(...)`
    calls (already discouraged in the docs) must move to `setTheme(input)`,
    which validates and returns `ThemeParseResult` — acceptance or the complete
    list of rejection reasons — leaving the active theme untouched on rejection.
  - `selectTheme(name)` now returns `boolean` and, for an unknown name, **does
    nothing** — previously it silently kept the old theme while still recording
    the bad key in `selectedThemeKey` and localStorage.
  - `themeOptions` is now a `computed` (was a once-written writable signal).

  **New**
  - **`registerTheme(input, { select? })`** validates and adds a theme to the
    live registry — it appears in `themeOptions`/`uni-theme-switch` immediately.
    **`unregisterTheme(id)`** removes it, falling back to the first remaining
    theme when it was active. Themes injected via `UNI_THEMES` are validated at
    startup; malformed entries are excluded with a console warning listing every
    reason.
  - **`applyPalette` registers the generated theme under `CustomTheme`**, so
    "Your Brand" is an ordinary, selectable option: it shows in the switcher,
    survives switching away and back, and `clearCustomPalette` unregisters it.
  - **`uni-select` fix:** a selection pointing at an option added in the same
    change-detection pass now applies (per-option `[selected]` binding; the
    select-level `[value]` write landed before new options existed and was
    ignored by the browser) — any consumer with a growing options list was
    affected.

### Minor Changes

- [`970c36d`](https://github.com/uni-design-system/uni/commit/970c36d3d2f57e3cc2ad18fc1b5498eb382c45d4) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-multi-select-dropdown`: a real accessible name, keyboard navigation, debounced filtering — and its first specs

  This was the weakest component in the library on exactly the axes the roadmap's
  combobox item names, and it had **no spec file at all**, which is why the
  missing accessible name survived since it was written.
  - **New `label` input, and the trigger finally names the field.** Its
    accessible name now reads "Fruits, 2 selected, Apple, Cherry". Previously it
    announced only the current selection — a screen reader user heard
    "Option 1, Option 3" with no way to tell which field it belonged to. The
    selection count comes along, so "how many did I pick" is not left to counting
    commas.
  - **Arrow keys, Home and End walk the options** from anywhere in the panel,
    including the filter box. Reaching the last of thirty options previously
    meant thirty `Tab` presses. Wrapping and the index arithmetic come from the
    CDK's shared `ListboxNavigation`, so the keys behave exactly as they do in
    `uni-search-input` and `uni-tag-input`.
  - **The filter is debounced** (new `debounceTime`, default 200ms) instead of
    re-filtering on every keystroke — the open item in TODO.md.
  - **An empty filter result says so** through `role="status"`, rather than
    leaving the panel blank.
  - **The options are grouped** as a `role="group"` labelled from `label`.
  - **20 specs**, covering the accessible name, selection and toggling, disabled
    behaviour, filtering and debounce, keyboard navigation, and the form-control
    contract.

  **A deliberate non-change:** the options stay real checkboxes rather than
  becoming a multi-selectable `listbox`. APG notes that multi-select listboxes are
  handled inconsistently across screen readers and suggests a checkbox group
  instead, and real checkboxes keep each option's state announced natively — so
  converting would have traded a well-supported pattern for a fashionable one,
  and duplicated the checkbox's animated visual into this component where it
  would drift.

- [`de83fe4`](https://github.com/uni-design-system/uni/commit/de83fe497a2f48569a7c49eea2e7ca640d931254) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-tag-input`, plus a shared listbox contract in the CDK

  The type-to-add chip field — recipients, filters, labels. It is the **open-set**
  control: anything typed can become a token, whether or not it matches a
  suggestion. Closed-set picking stays with `uni-select` /
  `uni-multi-select-dropdown`, which is the deliberate split — the two look alike
  but differ on the one thing that decides the value type, so a single component
  would force one of them to carry an API it can never use.
  - **`FormValueControl<UniTagItem[]>`.** `{ value: 'a@b.com' }` is a complete
    item; `label`, `avatarSrc`, `invalid` and `disabled` are optional enrichment.
  - **Invalid entries stay in the value, flagged**, rather than being dropped — a
    field that silently swallows a typo'd address is worse than one that shows it
    in red, and Enter on the chip lifts it back into the input to fix. Duplicates
    and over-`max` entries are refused through `(rejected)` with a reason.
  - **Full keyboard contract**: separators commit, Tab commits without trapping,
    Backspace on an empty field _focuses_ the last chip rather than deleting it
    blind, and on a chip Backspace and Delete both remove but move focus in
    opposite directions — what makes pruning a list feel right.
  - **The whole field is one tab stop.** Chips carry `tabindex="-1"`, so Tab never
    walks through eight recipients to reach the next control.
  - **Announces through a `role="status"` live region** on every add, remove and
    rejection; the removal route is described once per field rather than by every
    chip.
  - **`preset="email"`** wires an address validator, a paste parser that unwraps
    `Name <a@b.com>` and keeps an unterminated tail in the field, and Space as a
    separator.
  - **`'tagInput'` joins core's `ComponentName`** with a theme entry for the chip
    field's own tokens. Field chrome is not duplicated — it comes from `input` via
    `uni-input-box`, so a tag input restyles with every other field.

  **Also in this release**
  - **`ListboxNavigation` in the CDK** (`createListboxNavigation`) owns the
    combobox bookkeeping every type-ahead control needs: open state, active
    option, wrap-around arithmetic, Home/End, and `aria-activedescendant` wiring
    that can never point at an option a narrowing filter has removed.
    `uni-search-input` now uses it — behaviour unchanged, and it gains Home/End
    for free — and the multi-select combobox upgrade will too. Three hand-rolled
    copies of one keyboard contract is how they drift.
  - **`uni-tag` gains `controlTabIndex`**, so a composite that owns its own roving
    focus can take its chips out of the tab order, and **`selected` is now
    optional**: an interactive chip carries `aria-pressed` only when it is
    genuinely a toggle. Announcing "not pressed" on a recipient chip is worse than
    announcing nothing.

- [`5414517`](https://github.com/uni-design-system/uni/commit/5414517d52d17943a4730752ab5d90c304c37062) Thanks [@gaenglish](https://github.com/gaenglish)! - Themes registered from JSON get the built-in icons back

  `registerTheme` and `setTheme` now hydrate a theme's icons on the way in: the
  built-in set is merged _under_ whatever icons the payload carries, so the
  theme's own icons still win.

  This is what makes a theme fetched as JSON usable. Transports elide `BaseIcons`
  — roughly 71% of a serialized theme, and bytes the consumer already ships — so
  without hydration a fetched theme would validate cleanly and then render no
  icons at all. The rule is the same one `createTheme` already applies at
  construction (`{...BaseIcons, ...icons}`), so a theme behaves identically
  whether it was built in-process or arrived over the wire.

  Themes provided through `UNI_THEMES` are unaffected: they already carry the full
  set, so hydration is a no-op.

### Patch Changes

- [`3279186`](https://github.com/uni-design-system/uni/commit/3279186e2cee806056cfb446699ab108d30fb608) Thanks [@gaenglish](https://github.com/gaenglish)! - Menu items no longer look preselected when opened with the mouse

  Opening a `uni-menu` by click left the first item highlighted before the
  pointer had touched it, reading as a preselected default. Two correct
  behaviours combined badly: `onOpened()` implements ARIA roving focus by calling
  `.focus()` on an item every open, and the item styles deliberately painted
  `:focus` the same as `:hover`. Nothing was wrong with the focus itself — only
  with painting it after a pointer open.
  - **The highlight now keys on `:focus-visible`.** Programmatic focus following a
    click doesn't match it, while keyboard-driven focus does — so mouse users get
    no phantom highlight, and keyboard users keep the focus cursor. Roving-focus
    bookkeeping is untouched: a mouse open still moves focus to the first item, so
    screen readers announce it exactly as before.
  - **New `HOVER_OR_KEYBOARD_FOCUS` constant exported from uni-core**, holding
    that selector. Emotion merges styles by _exact selector text_, so a component's
    base rule and any theme variant restyling it have to agree character for
    character — a variant keyed `'&:hover, &:focus'` would both fail to override
    and reintroduce the phantom highlight. Naming the selector once removes the
    trap; the base theme's `menuItem.warn` tone and the Carbon/Wellsourced
    showcase themes now use it.

  Themes with their own `menuItem` variants should key the highlight with
  `HOVER_OR_KEYBOARD_FOCUS`. Note that `:focus-visible` is a browser heuristic:
  after a user has been navigating by keyboard, a subsequent click may still show
  the highlight, which is the intended "this person is using the keyboard"
  behaviour rather than a regression.

- Updated dependencies [[`3279186`](https://github.com/uni-design-system/uni/commit/3279186e2cee806056cfb446699ab108d30fb608), [`de83fe4`](https://github.com/uni-design-system/uni/commit/de83fe497a2f48569a7c49eea2e7ca640d931254), [`760b761`](https://github.com/uni-design-system/uni/commit/760b761ad77533e7e01f7a56731f74e470bbd948), [`6a4c7da`](https://github.com/uni-design-system/uni/commit/6a4c7da4c7c3f5758d8c66d1be714319c983e39e), [`5414517`](https://github.com/uni-design-system/uni/commit/5414517d52d17943a4730752ab5d90c304c37062)]:
  - @uni-design-system/uni-core@8.0.0

## 7.3.0

### Minor Changes

- [`c828982`](https://github.com/uni-design-system/uni/commit/c828982442e5bdc1d6884551160bbceac8ecf8f7) Thanks [@gaenglish](https://github.com/gaenglish)! - `expand` gains a themable, size-aware speed

  The reveal/collapse duration was hardcoded at 350ms, so a consumer wanting a
  snappier disclosure — or wanting adjacent styling to fade on the same clock —
  had nothing to reference. A fixed duration also reads differently at different
  sizes: sluggish on a two-line region, rushed on a full-page one.
  - **New `transitionSpeed` option in the `expand` theme options** (seconds,
    default `0.35`, matching alert/card `transitionSpeed`) sets the base
    duration. `'expand'` joins core's `ComponentName` union, so custom and
    derived themes can type an `expand` entry.
  - **Duration scales with content height.** The actual duration is
    `transitionSpeed × √(height ÷ 240px)`, clamped to ~0.15–0.6s at the default
    speed (the envelope scales proportionally with a themed speed), so perceived
    speed stays steady across region sizes. The curve and its constants
    (`expandDuration`, `EXPAND_DEFAULT_SPEED`, `EXPAND_MIN_DURATION`,
    `EXPAND_MAX_DURATION`, `EXPAND_REFERENCE_HEIGHT`) are exported from
    uni-core.
  - **New per-instance `transitionSpeed` input** sets an exact duration for one
    region, bypassing the scaling: `<uni-expand [transitionSpeed]="0.15">`.
  - **The resolved duration is exposed as the public `duration` signal** on
    `uni-expand`, so adjacent styling can move on the reveal's clock with a
    plain binding — `[style.transition-duration]="expand.duration() + 's'"` —
    keeping all timing in the theme/signal pipeline, with no custom CSS.
  - **`expand-toggle` gains a matching `transitionSpeed` input** and otherwise
    follows the theme token instead of its own hardcoded 350ms. Expand Area
    binds the region's resolved `duration` to its toggle, keeping chevron and
    reveal on one clock even when size-scaled or overridden.
  - **Speed is theme-reactive**: swapping themes at runtime retimes regions and
    chevrons live.
  - **Enter/leave easing is now `ease-in-out`** (was `ease-in`), matching the
    chevron rotation so trigger and region decelerate together.
  - **`UniExpandOptions` is exported** from uni-angular for
    `getComponentOptions<UniExpandOptions>('expand')` consumers.

- [`6e8b429`](https://github.com/uni-design-system/uni/commit/6e8b4297190ce6974114d7fc6c52e37866902633) Thanks [@gaenglish](https://github.com/gaenglish)! - Menus join the theme model: `menu` + `menuItem` component options, item tones, and dividers

  The menu was the only composite component with no theme surface of its own —
  panel chrome came from the shared `dropdown` entry and every item-level knob
  (height 38, `primary-container` hover, `check` active symbol, `label` type
  role) was hardcoded. Every Uni menu therefore looked identical, and the gaps a
  real product hits first (a red Delete, a separator before it, disabled rows)
  were only reachable via `::ng-deep`.
  - **New `menu` theme options** (`'menu'` joins core's `ComponentName` union):
    `minWidth`, panel `color`/`border`/`borderRadius`/`shadow` (each falling
    back to the `dropdown` options when unset, so menus follow generic popovers
    until a theme deliberately splits them), `paddingVertical`/
    `paddingHorizontal` (panel inset — `xs` inset plus item `borderRadius`
    yields the "hover pill" look; `none` yields full-bleed rows), and
    `dividerBorder`/`dividerSpacing` for separators.
  - **New `menuItem` theme options + variants** (`'menuItem'` joins
    `ComponentName`): `height`, `paddingHorizontal`, `gap`, `borderRadius`,
    `typeface`, `textColor`, `hoverColor`, `activeSymbol` (undefined removes the
    trailing check), and `transitionSpeed`. Theme `variants` on `menuItem` carry
    tones — the base theme ships a `warn` tone for destructive actions.
  - **`MenuItem` grows `variant`, `disabled`, and `{ divider: true }`.**
    `variant: 'warn'` routes through the theme's `menuItem` variants; `disabled`
    items render in the disabled color, carry `aria-disabled`, and are skipped
    by keyboard navigation; dividers render as `role="separator"` rules styled
    by the `menu` options. `isDivider` and the `UniMenuOptions`/
    `UniMenuItemOptions` interfaces are exported from uni-angular.
  - **`uni-dropdown` panel chrome is now input-overridable**
    (`border`/`borderRadius`/`shadow`/`color`), falling back to the `dropdown`
    theme options — this is the mechanism `uni-menu` uses; other consumers are
    unchanged.
  - **Default-rendering change:** menus now have `minWidth: 184` from the base
    theme (previously they sized to the widest item). All other defaults
    reproduce the previous look, including the 0.35s hover transition.
  - **The Carbon experiment themes gain menu styling** (sharp full-bleed 40px
    rows, IBM Plex, `$layer-hover`, red danger option, ~110ms motion) with a new
    Carbon Menu story demonstrating that the same component renders both
    aesthetics untouched.

### Patch Changes

- [`ba4e38d`](https://github.com/uni-design-system/uni/commit/ba4e38d88ad65bbba8badf2b42115acfd4d433e2) Thanks [@gaenglish](https://github.com/gaenglish)! - Tooltip no longer blinks after activating a wrapped control

  Clicking a button inside `uni-tooltip` used to fall through to the bubble's
  tap-to-toggle handler and then re-show on the still-hovering pointer — a
  state-flipping label ("Expand" → "Collapse") visibly blinked off and back on
  after the click.
  - **Activating an interactive element inside the host now hides the bubble
    and suppresses it** until the pointer leaves and returns (or focus moves
    away). Tap-to-toggle is unchanged for non-interactive hosts (inline text).
  - **`expand-toggle` drops its icon-only tooltip.** The rotating chevron plus
    `aria-expanded` and the button's accessible name already say everything the
    bubble restated; use the `label` input when a disclosure needs a visible
    name.

## 7.2.0

### Minor Changes

- [`8d77ed7`](https://github.com/uni-design-system/uni/commit/8d77ed75af1edf414baa7b9ea52a6982470b0c7c) Thanks [@gaenglish](https://github.com/gaenglish)! - Centre `icon-button`'s glyph, fix `expand-toggle`'s rotation, make `expand`
  block-level and motion-safe, and give `expand-toggle` a label

  Gaps found while building collapsible sections in a consuming app, where each
  one had to be worked around locally.
  - **`icon-button` centres its glyph.** Sizing `iconName` from the size token
    (shipped in the previous release) made the glyph smaller than the button —
    an `sm` button is a 22px box around an 18px icon — but the button was
    `display: block`, so the glyph sat in the top-left corner with all the slack
    on its right and bottom. It is now a centring flex box; flex is still
    block-level, so the button's own layout is unchanged, and the
    absolutely-positioned accessible-name span stays out of the flex flow.
    **Visual change** for every `icon-button`: glyphs shift to the middle of the
    box. `symbolName` ligatures centre too, which also means the known
    oversized-ligature case (a 24px glyph in a 22px `sm` box) now clips evenly on
    all sides instead of only bottom-right. Covered by a test.
  - **`expand-toggle` rotates the glyph instead of its host.** This is a fix to
    existing behaviour, visible in 7.1.0 and earlier: the 180° turn was applied to
    the component host, which is both the tooltip's positioning box (`uni-tooltip`
    sets `anchor-name` on its own element, nested inside the host) and taller than
    the glyph, since an inline-level box reserves baseline descender space. So the
    bubble bobbed along an arc as the chevron turned, and the chevron itself
    drifted off-centre rather than spinning in place. The transform now lands on
    `uni-icon` — a centred square sized to the glyph, and the only box here that
    rotates symmetrically. The host keeps its `toggled` attribute, so any consumer
    styling keyed on it still works.
  - **`uni-expand` is now `display: block`.** As a custom element it defaulted to
    `display: inline`, so its animated grid laid out as a block-in-inline box and
    the revealed content's spacing came out subtly wrong. Every consumer was
    writing `uni-expand { display: block }` by hand. **Visual change** for anyone
    who was relying on the inline default or already shipping that override — the
    override is now redundant and can be deleted.
  - **The reveal respects `prefers-reduced-motion`** (WCAG 2.3.3). The
    expand/collapse keyframes ran unconditionally; they're now wrapped in
    `motionSafe`, as is `expand-toggle`'s chevron rotation. Under reduced motion
    the region appears and disappears instantly. `overflow: hidden` moved inside
    the guard deliberately: it exists to clip the box mid-animation, and leaving
    it applied at rest would crop decorations that legitimately paint outside the
    region (focus rings, offset outlines). Angular removes a leaving node on the
    next frame when it detects no animation, so nothing hangs.
  - **`expand-toggle` takes `label` and `sublabel`.** It was chevron-only, so any
    disclosure that names its section — most of them — had to hand-roll the whole
    trigger row and its styles, which is how consumers end up with a private
    copy of this component. With `label` set the toggle renders a full-width row
    (chevron, label, muted qualifier) as a single button whose accessible name is
    the label, instead of an icon button sitting next to unrelated text. Only the
    chevron rotates, so the label stays upright. Omit `label` and the icon-only
    shape is unchanged, tooltip and all — `uni-expand-area` is unaffected.

- [`c532c95`](https://github.com/uni-design-system/uni/commit/c532c95d4a7adbf7c4015b8b556e3994c70948ed) Thanks [@gaenglish](https://github.com/gaenglish)! - Size `icon-button`'s `iconName` glyph from its size token

  `icon-button` rendered a `symbolName` ligature at a font size, but an `iconName`
  mask with no size at all — and the base `iconButton` size tokens carry no
  padding, so the icon filled the entire button box edge to edge. That made
  `symbolName` → `iconName` a visual regression rather than a like-for-like swap,
  which matters now that `uni-icon` is the preferred path (a mask paints on the
  first frame, where a ligature waits on the variable font).
  - `iconName` is now sized from the size token's `fontSize` — the same value that
    scales the rest of the control — so the glyph sits inside the button and grows
    with `size`. Concretely, `size="sm"` renders an 18px glyph in a 22px button
    instead of a 22px one.
  - **Visual change** for existing `iconName` call sites: glyphs get slightly
    smaller and gain breathing room. Themes that size icon-buttons with padding
    (e.g. the Carbon example) set a matching `fontSize`, so they land on the same
    glyph size either way and are unaffected.
  - Known gap, now covered by a test that documents rather than blesses it:
    `uni-symbol` takes its size from `opticalSize` (default 24) and ignores the
    button's size token, so a `sm` button renders a 24px ligature in a 22px box.
    Masked icons do not have that problem — one more reason to prefer `iconName`.

### Patch Changes

- [`c532c95`](https://github.com/uni-design-system/uni/commit/c532c95d4a7adbf7c4015b8b556e3994c70948ed) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix `uni-icon` ignoring `size="24"` written as a static attribute

  `size` appended `px` only to numbers, but a static template attribute arrives as
  a string — so `<uni-icon name="mail" size="24" />` emitted the invalid
  `width: 24`. Browsers drop an invalid declaration, which silently fell back to
  the stylesheet's `width: 100%; height: 100%`.

  That failed in two different ways depending on the container, neither of them
  obvious: inside a fixed box the icon quietly filled it (a 16px glyph rendering
  at 30px), and inside a content-sized flex row `height: 100%` collapsed to zero,
  so the icon vanished while still occupying full width and pushing its label
  across the row.

  A bare numeric string is now treated as px, matching the number form. Genuine
  CSS lengths (`'1.25rem'`, `'50%'`, `calc(…)`) still pass through untouched.
  `[size]="24"` was unaffected throughout, since property binding passes a real
  number.

## 7.1.0

### Minor Changes

- [`c2421c0`](https://github.com/uni-design-system/uni/commit/c2421c04d01f36d74b489613d22997553f256d4f) Thanks [@gaenglish](https://github.com/gaenglish)! - Expand `BaseIcons` to 59 icons and add `uni-icon` sizing

  The 34-icon set shipped in 7.0.0 covered the library's own components but not a
  real application — an app migrating off inline `<svg>` (or off `uni-symbol`, in
  Angular) ran out of names almost immediately. Everything here is additive; all
  34 existing names are unchanged.
  - **25 new icons**, same Material Symbols Outlined 300 source and the same
    `0 -960 960 960` grid as the rest of the set: navigation (`link`, `expand`,
    `gridView`, `listView`), actions (`moreHorizontal`, `copy`, `send`,
    `refresh`, `dragHandle`, `qrCode`), feedback (`star`, `verified`) and
    user/system (`group`, `shieldPerson`, `clock`, `mail`, `chat`, `image`,
    `document`, `payment`, `bank`, `trendingUp`, `extension`, `webhook`,
    `logout`).
    - `moreHorizontal` ships alongside `more` because that one is `more_vert` and
      row-aligned menus need the horizontal kebab.
    - `star` is separate from `favorite`, which is the heart.
  - **`uni-icon` gains an optional `size` input** (`CssLength` — bare numbers are
    px, strings pass through, so `20` and `'1.25rem'` both work). Left unset,
    behaviour is unchanged: the icon fills its container, which is what lets a
    themed control size its own glyph through padding. Set, it applies
    width/height as inline styles, so an explicit size wins over the
    fill-the-container rule regardless of style injection order. This removes the
    per-call-site `width`/`height` CSS rule that replacing an inline `<svg>` with
    `<uni-icon>` would otherwise need.
  - The MCP `create-icon-tokens` tool now lists the built-in icon names above the
    token map it returns. Apps routinely hand-draw their own `close`, `check` or
    `plus`; encoding those into theme tokens works but adds redundant artwork on a
    foreign grid when the theme already ships the glyph. The tool cannot recognise
    a shape, so it hands the caller the list to check against before adding
    anything.

## 7.0.0

### Minor Changes

- [`f7727aa`](https://github.com/uni-design-system/uni/commit/f7727aa8895bd67f285ba4830858f994490bb7f7) Thanks [@gaenglish](https://github.com/gaenglish)! - Replace `BaseIcons` with a normalized 34-icon Material Symbols set

  The built-in icon set was 11 glyphs drawn from four different grids
  (`0 0 24 24`, `0 0 50 50`, `0 0 64 64`, `0 -960 960 960`), so `checkCircle` and
  `xCircle` rendered as solid filled discs next to a hairline `alertCircle` and an
  oversized `close` — three optical weights in one set.
  - `BaseIcons` is now Material Symbols Outlined at weight 300, every glyph on a
    single `0 -960 960 960` grid, grouped by intent: navigation (`menu`,
    `chevronUp/Down/Left/Right`, `arrowLeft/Right`, `home`, `externalLink`),
    actions (`search`, `close`, `plus`, `minus`, `more`, `delete`, `edit`,
    `download`, `upload`, `share`, `filter`), feedback (`check`, `checkCircle`,
    `xCircle`, `alertCircle`, `info`, `warning`, `lock`) and user/system
    (`profile`, `settings`, `notification`, `favorite`, `help`, `calendar`).
  - All 11 previously shipped names are preserved, so existing `<uni-icon>` call
    sites and theme overrides keep working. Their **appearance changes**: the
    filled `checkCircle`/`xCircle` are now outlined, and the set reads lighter
    overall. `spinner` is carried over verbatim, keyframes intact.
  - New `IconName` and `BaseIconName` types. `IconName` is
    `BaseIconName | (string & {})`, so built-ins autocomplete and typos surface
    while themes can still register arbitrary names via `createTheme({ icons })`.
    `uni-icon`'s `name` input is typed with it instead of `keyof Icons`.
  - **Breaking**: removes the unused `IconToken`, `IconStyle`, `ToggleableIcon`
    and `IconConfig` exports. Nothing in the library referenced them and
    `IconToken`'s 60-name union contradicted the actual `BaseIcons` keys. Use
    `IconName` instead.
  - New exported `svgToIconUri(svg, options?)` — the supported way to bring your
    own icons (a brand set, a designer handoff) into a theme. It normalizes the
    source (drops the xml declaration, comments and fixed `width`/`height` so the
    mask scales), percent-encodes it, and **rejects artwork that cannot survive
    masking**: no `viewBox`, an embedded raster `<image>`, an external reference,
    a gradient/pattern fill, or more than one paint color. That last one is the
    trap worth naming — masks use the alpha channel, so a multi-color logo
    flattens to a silhouette in `currentColor`; pass `{ allowMultiColor: true }`
    when that is intended. `createTheme({ icons })` merges the result over
    `BaseIcons` per name, so a built-in name reskins and a new name is added.
  - New MCP tool `create-icon-tokens`, the agent-facing front end to
    `svgToIconUri`: hand it a project's inline `<svg>` (or a brand set) and it
    returns a paste-ready `icons` map for `uni-theme.ts`. It encodes via the same
    helper, so tokens are byte-identical to the built-in set, and adds the
    set-level checks a per-icon helper cannot make — which names override
    built-ins, and whether the artwork mixes viewBox grids. Bad artwork is
    reported per icon rather than failing the batch, and re-running is safe
    (already-encoded URIs pass through). The server instructions now point agents
    at it whenever they encounter inline SVG.
  - `BaseIcons` is generated by `scripts/generate-icons.mjs` (`pnpm icons:generate`),
    which fetches from the canonical Material Symbols source and validates every
    glyph before writing — a malformed path, an off-grid viewBox or geometry
    outside the grid aborts the run. `pnpm icons:check` verifies the committed
    file without writing. Add or change icons in that script's manifest and
    regenerate; the file is not hand-edited. `icon.records.spec.ts` asserts the
    same invariants against the committed output.

### Patch Changes

- Updated dependencies [[`f7727aa`](https://github.com/uni-design-system/uni/commit/f7727aa8895bd67f285ba4830858f994490bb7f7)]:
  - @uni-design-system/uni-core@7.0.0

## 6.1.0

## 6.0.1

### Patch Changes

- [`4bfb057`](https://github.com/uni-design-system/uni/commit/4bfb057c55651c0375e7f35dd6f804e8d5c69e88) Thanks [@gaenglish](https://github.com/gaenglish)! - Canonical MDX docs structure across the entire library
  - Component docs pages now follow one flow (spec in AGENTS.md): imports → Overview →
    Usage (the compact playground: story + source + knobs) → named variation examples →
    **Theme options** → Accessibility → Do/Don't. Property/API/Methods/Events tables are
    retired — the playground's controls are the API reference.
  - New `ThemeOptions` docs block renders a component's per-theme option tokens live from
    the active Storybook theme (with color swatches), distinguishing per-theme options
    from per-instance inputs; data-table's raw `ThemeDataBlock` dump is replaced.
  - All ~55 component pages conform: the 7 form-control pages (200–390 lines of legacy
    API tables) rewritten; empty Overviews authored (card, tag, icon-button, scroll-area,
    expand-area, data-table); accessibility bullets added across navigation, feedback,
    and form components.
  - The MCP index now carries when-to-use guidance for 55 of 70 components (was 41) and
    accessibility guidance for 36 (was 21) — the remainder are subcomponents documented
    on their parent pages and internal directives.

## 6.0.0

### Major Changes

- [`a02afee`](https://github.com/uni-design-system/uni/commit/a02afee3c1c4721ff626445684f41de432443731) Thanks [@gaenglish](https://github.com/gaenglish)! - Layout components are attribute-only, on any element

  **Breaking:** the shorthand element selectors `Box`, `Stack`, `Row`, `Grid`, `Wrap`,
  and `GridArea` are removed — a concept inherited from another library that conflicted
  with semantic HTML. Migrate to the attribute form: `<Box padding="md">` →
  `<div box-layout padding="md">` (GridArea → `grid-area-layout`).

  In exchange, the attribute selectors now apply to **any element**, not just `div` —
  layout and semantics compose: `<main box-layout [grow]="1" padding="md">`,
  `<nav stack-layout gap="sm">`, `<section stack-layout>`.

  Also documented, unchanged in behavior: the sizing convention (number = px via
  binding, `[height]="420"`; plain attribute = CSS length, `height="420px"`) and
  Stack/Row's `fit-content` min-size defaults (set `[minHeight]="0"` / `[minWidth]="0"`
  for scroll containment). All internal usages, stories, and docs are migrated —
  including the Divider story's `<Center>`, which had silently never rendered (Center
  never had an element selector).

- [`f1796fb`](https://github.com/uni-design-system/uni/commit/f1796fbb42015dafb3a122f6effe69bc2b07d525) Thanks [@gaenglish](https://github.com/gaenglish)! - Selector unification: one form per component

  **Breaking:** every PascalCase alias selector is removed (`Card`, `Menu`, `Symbol`,
  `Icon`, `Dialog`, `Button`, `Tabs`, `Snackbar`, `SelectInput`, `Confirmation`, … — a
  concept inherited from another library). Each component now has exactly one canonical
  form, chosen by what the component is:
  - **Widgets and content-renderers** keep their `uni-*` element: `<uni-card>`,
    `<uni-menu>`, `<uni-symbol>`, `<uni-icon>`, `<uni-tabs>`, `<uni-select>`,
    `<uni-confirmation-dialog>`, …
  - **Decorators of native elements** are attribute-only, and their `div`-locks are
    lifted: `[uni-badge]`, `[uni-dialog-header]` (e.g. on `<header>`),
    `[uni-dialog-buttons]`/`[dialog-buttons]` (e.g. on `<footer>`),
    `[uni-scroll-area]`/`[scroll-area]`, `[uni-menu-item]`/`[menu-item]` (e.g. on
    `<li>`).
  - **Host-locked selectors stay host-locked** where the native element carries the
    behavior: `dialog[uni-dialog]`, `button[uni-text-button]`/`button[text-button]`,
    `button[uni-icon-button]`/`button[icon-button]`.

  Migration is mechanical: `<Card>` → `<uni-card>`, `<Button …>` →
  `<button text-button …>`, `<Dialog …>` → `<dialog uni-dialog …>`, `<Badge …>` →
  `<div uni-badge …>`, `<ScrollArea …>` → `<div scroll-area …>`. All internal usages,
  stories, and docs are migrated; `llms.txt` and the MCP index reflect the canonical
  forms.

- [`a62e9b1`](https://github.com/uni-design-system/uni/commit/a62e9b116f0b57cf2a1e647155bc2fbc02b02b87) Thanks [@gaenglish](https://github.com/gaenglish)! - Text is attribute-only, with a value shorthand and element-aware defaults

  **Breaking:** the `uni-text` and `Text` element selectors are removed. Text is now the
  attribute `[uni-text]` on any element, keeping your HTML semantics:
  - **Value shorthand** — the attribute value is the typeface:
    `<h1 uni-text="display-small">`, `<span uni-text="caption">`, dynamic via
    `[uni-text]="role()"`. The explicit `typeface` input still works (the attribute
    value wins when both are set).
  - **Element-aware defaults** — with no value, the typeface is inferred from the host:
    `h1`→headline-large, `h2`→headline-medium, `h3`→headline-small, `h4`→title-large,
    `p`→body-1-long, `small`/`figcaption`→caption, `blockquote`→quote, `label`→label,
    else title-small. Plain semantic markup is correctly set with zero configuration.

  Migrate `<uni-text typeface="body-1-long">…</uni-text>` →
  `<p uni-text>…</p>` (or `<span uni-text="body-1-long">` where no semantic element
  fits). All internal usages, stories, and docs are migrated.

### Minor Changes

- [`5a6fc60`](https://github.com/uni-design-system/uni/commit/5a6fc601952e0cbda80810a1c9062588c675d89f) Thanks [@gaenglish](https://github.com/gaenglish)! - Search input stripped back and made generic; debounce input dressed in the shared chrome
  - **`uni-debounce-input`** now wears the themed input chrome via `uni-input-box`
    (color, border, typeface, focus ring) and gains `label` (accessible name),
    `placeholder`, `disabled`, `pre-input`/`post-input` attribute slots for adornments,
    ARIA passthroughs (`role`, `ariaExpanded`, `ariaControls`, `ariaActivedescendant`)
    for composite widgets, and `clear()`/`focus()` methods. Debounce behavior unchanged.
  - **`uni-search-input` redesigned**: the opinionated solid-primary pill bar with the
    embedded `title-large` label is gone. It's now a standard themed field — decorative
    leading magnifier, clear button while a query exists (refocusing on clear), Enter
    emits `search`, Escape closes/clears.
  - **Type-ahead added**: pass `suggestions` (refresh from `change`) and the field
    becomes an ARIA combobox — keyboard-navigable listbox (ArrowUp/Down, Enter selects,
    emitting `suggestionSelected` + `search`), `aria-activedescendant` wiring, focus-out
    closing. New `searchInput` theme options: `searchSymbol`, `clearSymbol`, suggestion
    list `listColor`/`listShadow`/`listBorderRadius`, `maxSuggestions`.
  - Visual breaking change for SearchInput consumers (deliberate strip-back); code API
    is compatible (`label`/`width`/`change`/`search` retained; `label` is now the
    accessible name + placeholder fallback rather than displayed text).

- [`8953d59`](https://github.com/uni-design-system/uni/commit/8953d59aa5f5eed57801534c7cbf5ff05453c316) Thanks [@gaenglish](https://github.com/gaenglish)! - Checkbox, radio, and toggle conform to theme tokens
  - The last hardcoded control colors (`#FFF`, `#ccc`, `#d0d0d0`, `#e0e0e0`,
    `rgba(0,0,0,0.2)`) are gone. Chrome now resolves from new option tokens —
    checkbox `boxColor: 'surface'`; radio `ringColor: 'outline'` / `fillColor:
'surface'` (radio gains a theme entry for the first time); toggle `trackColor:
'surface-variant'` / `knobColor: 'surface'` — so all three finally render
    correctly on dark and brand themes.
  - The checkbox's check/dash strokes wear the variant's paired on-color
    (`on-primary`, `on-warn`, …) instead of assuming white; disabled states use the
    `disabled`/`on-disabled` tokens; the toggle knob's shadow is the theme's
    brand-tinted `raised` stack, and its hover uses the button convention's
    brightness filter instead of a fixed grey.

- [`7a6da4f`](https://github.com/uni-design-system/uni/commit/7a6da4f60979795f10e85493d1d13543f6a5a0e1) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-stat` KPI tile
  - Muted label + large headline value (numbers auto-compact via
    `Intl.NumberFormat`: `48234` → "48.2K") set in a new `stat` type-scale role
    (32px semibold, proportional figures).
  - Optional signed `delta` whose ink is decided by direction × `upIsGood` — churn
    going down reads green, tickets going up reads red — with the arrow glyph
    accompanied by screen-reader "up"/"down" text so state never rides color alone;
    `caption` names the comparison period.
  - Optional decorative 12-point sparkline (`trend` input): stroke in the outline hue,
    endpoint dotted in the accent, `aria-hidden`.
  - Fully token-driven via `stat.options`: card-recipe frame (`color`/`border`/
    `borderRadius`), `labelTypeface`/`valueTypeface`, `positiveColor`/`negativeColor`
    (the semantic inks, AA-guaranteed on surface), `trendColor`/`trendAccent`, spacing.

- [`fea0b2e`](https://github.com/uni-design-system/uni/commit/fea0b2e78da327f3acea144958af2d0dbbefb699) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix invisible icons; icons become first-class theme primitives
  - **Bug**: `uni-icon` resolves icons from `theme.icons`, but every theme shipped
    `icons: {}` — the icon record was never wired in, so all icons (dialog close, button
    spinner, search/clear affordances) rendered nothing.
  - **Fix + pattern**: the default icon set now lives in core (`BaseIcons`, in
    `concepts/iconography`) and `createTheme` merges a theme's `icons` over it — themes
    can override or add icons under any name (inline SVG data URIs, masked with
    `currentColor` so they recolor with the theme). The angular `icons` record re-exports
    `BaseIcons` (deprecated).
  - `uni-icon` also sets the standard `mask-image` (was webkit-only, so icons were
    invisible in Firefox regardless) and renders nothing for unknown names instead of a
    broken `url("undefined")`.
  - The emitted `uni-theme.ts` gains an editable `icons` section, and the MCP's
    `generate-uni-theme` guidance instructs agents: never inline SVG in components —
    define an icon once in the theme's `icons` map and render it via `<uni-icon>`.

### Patch Changes

- Updated dependencies [[`5a6fc60`](https://github.com/uni-design-system/uni/commit/5a6fc601952e0cbda80810a1c9062588c675d89f), [`8953d59`](https://github.com/uni-design-system/uni/commit/8953d59aa5f5eed57801534c7cbf5ff05453c316), [`7a6da4f`](https://github.com/uni-design-system/uni/commit/7a6da4f60979795f10e85493d1d13543f6a5a0e1), [`fea0b2e`](https://github.com/uni-design-system/uni/commit/fea0b2e78da327f3acea144958af2d0dbbefb699)]:
  - @uni-design-system/uni-core@6.0.0

## 5.2.0

### Minor Changes

- [`1f5ee1d`](https://github.com/uni-design-system/uni/commit/1f5ee1dce290aceceec628677fdc9e36b5c5031f) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-avatar` and `uni-avatar-group` components
  - Graceful fallback chain: image → initials derived from `name` (first + last) →
    themed symbol. Accessible by default: `role="img"` + `aria-label` from the name,
    `aria-hidden` when purely decorative.
  - Fully token-driven: variants color from the role's `*-container` tokens, sizes from
    the theme's `avatar` size records, corner radius from `options.borderRadius`
    (`max` = circles; a `sharp` theme gets square avatars), initials typeface from
    `options.typeface`, fallback symbol from `options.fallbackSymbol`.
  - `uni-avatar-group` stacks avatars with a token-driven overlap (spacing token) and
    separator ring (`ringColor`/`ringWidth` options); `max` collapses the overflow into
    a themed "+N" chip that is itself a `uni-avatar` (verbatim `text` input).

- [`dca84b1`](https://github.com/uni-design-system/uni/commit/dca84b1f5a49d56608bac098c26b0e90992ed49d) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-breadcrumb` component
  - WAI-ARIA breadcrumb: labelled `nav` landmark wrapping an ordered list, the last item
    marked `aria-current="page"`, separators decorative (`aria-hidden`).
  - Data-driven `items` (root first). Items with `href` render as real anchors; without
    one they render as link-styled buttons emitting `itemClicked` for SPA routing.
  - Token-driven via `breadcrumb.options`: `typeface`, link `color`, `currentColor`,
    `separatorSymbol` (material symbol), and `gap` spacing.

- [`7844dde`](https://github.com/uni-design-system/uni/commit/7844ddec88f40027dafcaed5192f88d3c0cec54f) Thanks [@gaenglish](https://github.com/gaenglish)! - Button corner rounding and typography conform to component-options tokens
  - `button` and `iconButton` themes gain `options: { borderRadius: 'max' }`; the hardcoded
    per-size pixel radii (11/13/18/24) and the icon button's inline `borderRadius: 999` are
    removed. Components resolve the token through `theme.radius()`, so the theme's radii
    scale — shape languages (`sharp` → square, `playful` → pill) and custom radii
    primitives — now restyles buttons like every other tokened component.
  - Back-compat: the options radius is applied before theme `sizes`/`fixed` styles, so
    hand-authored themes that still set a size-level `borderRadius` keep winning; icon
    buttons fall back to the legacy circle when a theme predates iconButton options.
  - `button` themes also gain `options: { typeface: 'button' }`: the hardcoded
    `fontFamily: 'Euphemia'` (a font no theme loads) is removed from `fixed` and the sizes;
    labels now render the type scale's `button` role (Red Hat Display, medium, capitalize),
    with per-size `fontSize` still applied by `sizes`. Point the token at any typography
    role — including custom ones — to restyle every button label.
  - New `UniButtonOptions` interface (`borderRadius`, `typeface`) exported from the button
    model.

- [`7844dde`](https://github.com/uni-design-system/uni/commit/7844ddec88f40027dafcaed5192f88d3c0cec54f) Thanks [@gaenglish](https://github.com/gaenglish)! - Card frame conforms to token primitives
  - The card theme's hardcoded frame (`borderStyle`/`borderWidth`/`borderRadius: '8px'` in
    `fixed`, `borderColor` per variant) is replaced by tokens: the card resolves its border
    from the **border primitive named by its variant** (`borders.primary` …
    `borders.success`), its corner radius from the radii scale (`options.borderRadius:
'xs'` — same 8px by default), and an optional `options.elevation` shadow token.
  - `UniCardOptions` gains `border` (pin every card to one primitive — including a custom
    one — instead of variant-following) and documents the existing `borderRadius`/
    `elevation`; redefining a border primitive in a theme now restyles cards and every
    other component sharing that token.
  - Token styles apply under the merged theme style, so hand-authored themes that still
    set card `fixed`/`variants` frame styles keep winning. No visual change for default
    themes — this is pure tokenization.

- [`17cf662`](https://github.com/uni-design-system/uni/commit/17cf6621dd78e4af0c8af3575f6a5d103d9fca53) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-drawer` and `uni-app-bar` — the dashboard shell
  - **`uni-drawer`** has two modes sharing one content slot: `side` renders an in-flow
    `<aside>` that pushes content (width-animated open/close, divider border primitive at
    its edge, `aria-hidden` while closed); `over` renders a native `<dialog>` in the top
    layer — focus trap, Escape, and scrim backdrop come from the platform, sliding in
    from `position` (`start`/`end`). `open` is a two-way `model()`; Escape and backdrop
    clicks keep it in sync. Tokens: `drawer.options` (`color`, `width`, `divider`,
    `elevation`, `padding`, `backdrop`).
  - **`uni-app-bar`**: leading/trailing content projection slots around a `title` (or
    custom center content), trailing pushed to the far edge; optional `sticky`. Tokens:
    `appBar.options` (`color`, `height`, `divider`, `typeface`, `padding`, `gap`,
    optional `elevation`).
  - The Drawer "DashboardShell" story documents the composition recipe: app bar with a
    menu toggle + side drawer + content.

- [`7844dde`](https://github.com/uni-design-system/uni/commit/7844ddec88f40027dafcaed5192f88d3c0cec54f) Thanks [@gaenglish](https://github.com/gaenglish)! - Progress gauge derives from the palette instead of hardcoded pastels

  The gauge's track colors were fixed pastel hexes (`#b3d4ea`, `#b3e7c2`, …) that ignored
  the active theme entirely — secondary and success even shared the same green. Tracks now
  use the role's `*-container` token (the palette's soft tint of that role) and arcs the
  role base, so gauges follow any brand palette, in both light and dark modes.

- [`4ccf18b`](https://github.com/uni-design-system/uni/commit/4ccf18ba86dc81c344597c7bc3e46f5d92f3c232) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-skeleton` loading placeholder
  - Three shapes: `text` (multi-line, ending on a short line like real copy), `rect`,
    and `circle`; explicit `width`/`height` accept CSS strings or px numbers.
  - Painted with surface tokens (`skeleton.options`: `color`, `highlightColor`,
    `borderRadius`, `gap`) so placeholders sit naturally on light and dark themes; the
    shimmer sweep (`animation`/`duration` options) only runs when the user allows motion
    and degrades to static blocks under `prefers-reduced-motion`.
  - `aria-hidden` — placeholders are invisible to assistive tech by design.

- [`5d9062a`](https://github.com/uni-design-system/uni/commit/5d9062ac36f782f2ebbc7012367121b0b86baf9c) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-slider` component — clears the declared-but-unbuilt `ComponentName` entry
  - Native `<input type="range">` under the hood: platform keyboard interaction
    (arrows, Home/End, Page Up/Down) and ARIA slider semantics for free; Signal Forms
    contract (`FormValueControl<number>`) matching Input/Textarea.
  - `min`/`max`/`step` inputs (fractional steps supported), required accessible `label`.
  - Token-driven via `slider.options`: fill/thumb `color`, `trackColor`, `borderRadius`,
    and geometry (`trackHeight`, `thumbSize`). The fill level rides a CSS custom
    property, so dragging never regenerates Emotion styles; Firefox uses the native
    `::-moz-range-progress`, WebKit a gradient stop.

- [`15a8f73`](https://github.com/uni-design-system/uni/commit/15a8f731f70bcd84211b7ff16b9272a2c6f2adc8) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-tabs` / `uni-tab` components
  - Full WAI-ARIA tabs pattern: `tablist`/`tab`/`tabpanel` roles with wired
    `aria-selected`/`aria-controls`/`aria-labelledby`, roving tabindex, automatic
    activation on ArrowLeft/ArrowRight (wrapping, disabled tabs skipped), Home/End,
    and motion-safe transitions.
  - `selectedIndex` is a two-way `model()`; selection snaps to the nearest enabled tab.
    Panel content is captured per-tab and only the selected panel is instantiated.
  - Every visual knob is a theme option token (`tabs.options`): `typeface`, `textColor`,
    `activeTextColor`, `indicatorColor`, `indicatorThickness` (thickness token),
    `divider` (border primitive), `gap`/`padding` (spacing tokens), `borderRadius`, and
    optional `activeColor` — the defaults render underline tabs; `borderRadius: 'max'` +
    `activeColor` turns them into segmented pills with no component changes.

- [`b04b97b`](https://github.com/uni-design-system/uni/commit/b04b97bd109e36cbb8fcda31c73680d85509ab0a) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-textarea` component
  - Multi-line text field with the same Signal Forms contract as `uni-input`
    (`FormValueControl<string>`: `value` model, `disabled`/`invalid`/`dirty`/`required`,
    touched-aware error styling, `aria-*` wiring).
  - Reuses `uni-input-box` for its chrome, so it inherits the input's themed color,
    border, typeface, focus outline, and disabled treatment automatically; the box's
    field selectors now cover `textarea` (with auto height and vertical padding), and
    the box accepts a `height` override.
  - Theme options follow the token pattern: `textarea: { options: { rows: 3, resize:
'vertical' } }` in the derived component themes; the `rows` input overrides per
    instance.

- [`8f55b4c`](https://github.com/uni-design-system/uni/commit/8f55b4ca34bfa7006c5d55c895b323931a3d6a1b) Thanks [@gaenglish](https://github.com/gaenglish)! - Theme Builder becomes the full playground (PRD §5.2)
  - **Light & dark side by side**: both palettes generate on every input change,
    independent of the storybook-wide mode toggle, each rendered in its own panel.
  - **Contrast report panel**: live pass/fail matrix over all checked pairs (summary +
    failing rows always visible, full detail on demand). Failures only occur with hard
    brand pins; the panel says so and points at soft targets.
  - **Shape language input** (`sharp`/`modern`/`playful`): applies `ShapeRadii` live via
    the new `radii` pass-through on `BrandPaletteConfig`/`createThemeFromPalette`.
  - **Export paths**: copy the static `uni-theme.ts` (via `emitThemeFile`), copy a
    pre-encoded `ng add` command, or copy W3C DTCG JSON for both modes via the new
    `emitDtcgTokens()` interop emitter in uni-core (Style Dictionary compatible).

## 5.1.0

### Patch Changes

- [`f2951db`](https://github.com/uni-design-system/uni/commit/f2951db7f6267f29b56d127151ff843d445c40a4) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix `ng add` against real published packages (found by fresh `ng new` e2e):
  - The schematic bundle is CJS, but ng-packagr stamps `"type": "module"` into the
    published package.json, so Node loaded it as ESM and the CLI reported "no ng add
    actions". A nested `schematics/package.json` (`"type": "commonjs"`) scopes the
    bundle back to CJS.
  - The emitted `uni-theme.ts` used dot access on `Colors` (which has an index
    signature), failing under `ng new`'s strict `noPropertyAccessFromIndexSignature`.
    The emitter (and the MCP tool's guidance) now uses bracket access throughout.
  - `uni-angular`'s peer range on `uni-core` is now `workspace:^` (publishes as `^5.x`)
    instead of `workspace:*` (published as an exact pin). Alongside changesets'
    `onlyUpdatePeerDependentsWhenOutOfRange`, this stops minor releases from being
    inflated to majors by the peer-dependents rule — the cause of the 4.0.0 and 5.0.0
    version jumps.

## 5.0.0

### Minor Changes

- [`f7f0bdd`](https://github.com/uni-design-system/uni/commit/f7f0bdddfac855955e022a852c2bfdccf8013a7b) Thanks [@gaenglish](https://github.com/gaenglish)! - OKLCH theme generation engine (`concepts/generation`)
  - New `generateThemes(input)` / `generateUniThemes(input)`: brand seed(s) in, complete
    WCAG-AA light+dark `Colors` pair out, with a machine-readable `ContrastReport`
    (110 checked pairs per theme pair). Pure and deterministic.
  - All palette math moved from HSL to perceptual OKLCH: uniform lightness slots across
    hues, per-category chroma model (`CategoryChroma`), dark-mode accent chroma decoupling
    (C ≤ 0.16), and a contrast guard-rail that adjusts lightness only — never hue.
  - Brand colors ride as soft `targets` (kept verbatim when already AA, lightness-adjusted
    when not) alongside the existing hard `brand` pins; accepted by `generatePalette`,
    `createThemeFromPalette`, and Angular's `BrandPaletteConfig`.
  - Semantic inks re-tuned per role: error 27°/C 0.20, warn 55°/C 0.18 (rotated off amber —
    dark yellow reads brown), success 152°/C 0.16.
  - `createTheme` accepts optional `radii`/`shadows` overrides; `ShapeRadii` presets
    (`sharp` / `modern` / `playful`) emitted via the `shape` generation input.
  - Theme Builder ships nine curated AA-clean presets built on soft targets.
  - Deprecated (thin wrappers/tables retained): `uniColor`, `randomRangeValue`,
    `CategorySaturation`, `CategoryLightness`. `schemeHues` moved to `color.utils`.
  - `createTheme` deep-merges optional `borders` and `components` overrides over its
    derived defaults — themes can define custom named primitives and rewire per-component
    options without restating untouched sections.
  - New `emitThemeFile()` renders a static `uni-theme.ts` — literal colors, visible border
    primitives, sparse component overrides — the editable source of truth; the engine
    never ships to the browser.
  - New `ng add @uni-design-system/uni-angular` schematic: installs the peer set, writes
    the generated theme file, registers `UNI_THEMES` in `app.config.ts`, adds typeface
    links, scaffolds a themed smoke test, and prints the contrast summary.
  - New MCP tool `generate-uni-theme`: returns the static theme file content, provider
    snippet, and contrast report, with agent guidance to edit the file for restyling.
  - `uni-core` gains its first Vitest suite, including a 1,080-seed contrast property
    corpus with zero tolerance in both modes; the schematic gets its own spec suite.

### Patch Changes

- Updated dependencies [[`f7f0bdd`](https://github.com/uni-design-system/uni/commit/f7f0bdddfac855955e022a852c2bfdccf8013a7b)]:
  - @uni-design-system/uni-core@5.0.0

## 4.0.0

### Minor Changes

- [`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9) Thanks [@gaenglish](https://github.com/gaenglish)! - Porting Components

### Patch Changes

- Updated dependencies [[`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9)]:
  - @uni-design-system/uni-core@4.0.0

## 3.0.2

### Patch Changes

- [`dcaf166`](https://github.com/uni-design-system/uni/commit/dcaf1668fb94716b192c65137a14f3ea561a0142) Thanks [@gaenglish](https://github.com/gaenglish)! - Extending the Symbol component to support theme options.

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.2

## 3.0.1

### Patch Changes

- [`fabbb73`](https://github.com/uni-design-system/uni/commit/fabbb73e7b2124e14b3cc263b2b8ca43e0cf80bd) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting new components and formatting.

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.1

## 3.0.0

### Minor Changes

- [`54a945c`](https://github.com/uni-design-system/uni/commit/54a945c51635898acb0c8ec0dd93ee234c580228) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting Components, Themes, and CDK

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.0

## 2.0.4

### Patch Changes

- [`ad5dd15`](https://github.com/uni-design-system/uni/commit/ad5dd151d245765b9d24a6ad1370a3e9d0d6b63e) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting multiple Angular Components

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.4

## 2.0.3

### Patch Changes

- [`eb80cff`](https://github.com/uni-design-system/uni/commit/eb80cffaaba0009c1c30875f93ea7e75dcf92302) Thanks [@gaenglish](https://github.com/gaenglish)! - fix: setting dist directory in publishConfig

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.2

## 2.0.1

### Patch Changes

- [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4) Thanks [@gaenglish](https://github.com/gaenglish)! - Setting Fixed Versioning for all packages.

- Updated dependencies [[`e2cad74`](https://github.com/uni-design-system/uni/commit/e2cad74631b3a9d2caf4816bcadedf19db99fec4), [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4)]:
  - @uni-design-system/uni-core@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [[`4a049de`](https://github.com/uni-design-system/uni/commit/4a049def689d56d6b6cc1d2da73c9facd93ed515)]:
  - @uni-design-system/uni-core@1.1.0

## 1.0.0

### Major Changes

- [`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756) Thanks [@gaenglish](https://github.com/gaenglish)! - init release

### Patch Changes

- Updated dependencies [[`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756)]:
  - @uni-design-system/uni-core@1.0.0
