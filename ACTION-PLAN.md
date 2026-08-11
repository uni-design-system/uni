# Post-build action plan

Composed 2026-08-11, after the runtime theme JSON work landed. Sequences what
happens next; it does not restate the strategic tracks in `ROADMAP.md` or the
component lineup in `TODO.md`, it points at them.

**Standing priority: the component library for human use comes first.** The MCP
and generative-UI work is real but secondary — it is a distribution channel for
a library whose value is created by the components themselves. Section 5 parks
the MCP with an explicit list of what's outstanding so nothing is lost; sections
1–4 are the work.

---

## 0. What just landed (context)

Runtime theme JSON, closing ROADMAP Track 1 item 4: `hydrateTheme` /
`dehydrateTheme` and a contrast-carrying `generateUniThemes` in core; the
`generate-runtime-theme` and `get-runtime-theme` MCP tools (the repo's first
with an `outputSchema`); a public CORS-enabled `GET /themes/{id}.json` registry
on the HTTP server; and icon hydration in `ThemeService` so a fetched theme
renders. Three changesets are staged. **Not committed.**

---

## 1. Immediate — close out the current blast radius

### 1a. Menu phantom highlight (`menu/menu_update.md`) — ✅ DONE 2026-08-11

Shipped: the highlight keys on `:focus-visible`, and the selector now has one
name — `HOVER_OR_KEYBOARD_FOCUS`, exported from uni-core — so the base rule and
every theme variant agree by construction instead of by careful spelling. All
five acceptance criteria verified in-browser; two specs added and
mutation-tested (they fail when the bug is reintroduced). Changeset:
`menu-item-focus-visible.md`. `menu_update.md` can be deleted.

One thing worth knowing: `:focus-visible` is a browser heuristic, so a click
that follows keyboard navigation still shows the highlight (Blink propagates
focus-visible through programmatic focus when the previously focused element
had it). That is the intended "this person is using the keyboard" behaviour,
not a leftover bug. A pure-mouse session shows no highlight at all.

<details><summary>Original analysis</summary>

The filed bug: opening a menu by mouse leaves the first item pre-highlighted,
because roving focus calls `.focus()` on open and the item styles paint `:focus`
identically to `:hover`. The proposed fix (`:focus` → `:focus-visible`) is
correct and the acceptance criteria in that file are the right ones.

**The part the bug report doesn't cover.** The menu-item variant mechanism
overrides the base hover pair by **exact style-key match** — a variant's
`'&:hover, &:focus'` replaces the base rule of the same name. Change the
component to `'&:hover, &:focus-visible'` without changing the variants and they
no longer override anything: the base hover rule survives *and* the variant adds
a second one, so the `warn` tone renders wrong. All four move together:

- `packages/angular/src/lib/components/menu/menu-item/menu-item.component.ts:79`
  (base pair) and the comment at `:90` describing the override contract
- `packages/core/src/concepts/theme/themes/base.theme.ts:304` (`menuItem.warn`)
- `packages/angular/src/stories/themes/carbon.theme.ts:410`
- `packages/angular/src/stories/themes/wellsourced.theme.ts:453`

Add a spec asserting the `warn` variant still wins on hover after the change —
that is the regression this coupling invites. Worth considering whether the
override contract should stop depending on key spelling at all (a `hover`/`focus`
option pair the component composes, rather than a raw selector), since any theme
author hits the same trap.

</details>

### 1b. `uni-tag` has zero specs — ✅ DONE 2026-08-11

`tag.component.spec.ts` now characterizes v1 in 9 specs, split into two groups
so the rewrite is a deliberate decision rather than an accident:

- **Contract v2 should preserve** — label rendering, the remove control's
  accessible name, emission of the value on click, numbers staying numbers,
  one emission per click.
- **Known v1 defects**, named `DEFECT:` in the test title and cross-referenced
  to SPEC.md. When v2 lands each should *fail* and be rewritten as the
  corrected expectation. Mutation-verified: applying the v2 falsy-value fix
  (`if (v)` → `if (v !== undefined)`) fails that spec and leaves every contract
  spec green, which is exactly the signal the rewrite needs.

Colors, radii and spacing are deliberately not asserted — they are welded into
the template today and v2 moves them behind a `tag` theme entry, so pinning
them would only manufacture failures the rewrite has to delete.

**Three things the characterization turned up, all of which affect Part 1 of
SPEC.md:**

1. **The accessible name is assembled, not declared.** `uni-symbol` renders its
   ligature as literal text (`close`) *inside* the remove button, and the name
   only comes out right because the symbol is `aria-hidden` and the projected
   "Remove {label}" sits in a visually hidden span. v2's anatomy adds a lead
   slot (avatar / symbol / dot) inside the chip body — if any of that lands
   un-hidden the announced name silently becomes "AC Alice Chen", so the spec
   asserts the announced name with `aria-hidden` content stripped rather than
   raw `textContent`. Keep that helper.
2. **The docs and the implementation disagree.** `tag.mdx` calls tags
   "display-only chips" while every tag ships a remove button and a `close`
   output. v2's opt-in removal resolves it; the MDX needs rewriting either way.
3. **`label` is documented as required** in `tag.stories.ts` `argTypes` but is
   an optional `input<string>()`, and with no label the button is announced as
   a bare "Remove". v2 should decide whether label is genuinely required.

No changeset: tests only, no consumer-visible change.

---

## 2. Next component — `uni-tag` v2 ✅ + `uni-tag-input`

**Q4 decided 2026-08-11: keep them separate.** `uni-tag-input` is the open-set
control with its own `UniTagItem[]` value; the roadmap's combobox item is
satisfied by upgrading `multi-select-dropdown` rather than adding a third
overlapping component. Extract the shared listbox behaviour as the work
proceeds. Reasoning in the decision brief below.

**`uni-tag` v2 shipped 2026-08-11.** `'tag'` in `ComponentName` + `TagTone` in
core, full theme entry (variants × tones as nested `&.tone-*`, sizes as geometry
only), component rewritten with opt-in `removable`, `interactive` body button,
lead slot, `invalid`/`disabled`/`maxWidth`, `(close)` → `(removed)`, and the
falsy-value bug fixed. 21 specs (from zero), stories, MDX, ACCESSIBILITY.md, and
a major changeset with the codemod described. Two bugs found by looking at it in
a browser rather than by testing: the remove button was 22px inside a 24px chip
(now sizes from the chip), and `ngTemplateOutlet` was used without importing
`NgTemplateOutlet`, which silently rendered no body at all.

**Shared CDK listbox shipped 2026-08-11.** `createListboxNavigation` in
`cdk/listbox/` owns open state, the active option, wrap-around arithmetic,
Home/End, and `aria-activedescendant` wiring that can never dangle when a
narrowing filter shrinks the list. 15 specs. `uni-search-input` was refactored
onto it — its 5 existing specs pass unchanged, proving the extraction, and it
gained Home/End for free.

**`uni-tag-input` shipped 2026-08-11.** `FormValueControl<UniTagItem[]>`, the
full keyboard contract from SPEC.md (separators, Tab-commits-without-trapping,
Backspace-focuses-then-removes, Backspace/Delete moving focus in opposite
directions, Enter/F2 to edit), paste with `Name <address>` unwrapping and tail
retention, `email` preset, live-region announcements, one tab stop for the whole
field. 42 specs ported from the prototype's Playwright suite; verified in a real
browser end to end. `'tagInput'` in `ComponentName` + theme entry; field chrome
still comes from `input` via `uni-input-box`.

**`multi-select-dropdown` upgraded 2026-08-11 — section 2 complete.** New
`label` input so the trigger names the field (its accessible name was missing
entirely); arrow/Home/End navigation over the options via the shared
`ListboxNavigation`; debounced filtering (closing the TODO.md item); an
announced empty-result state; and 20 specs where it had none.

**Deliberately not converted to a multi-selectable `listbox`**, despite that
being the literal phrasing of the roadmap item. APG notes multi-select
listboxes are handled inconsistently by screen readers and recommends a
checkbox group; real checkboxes also keep each option's state announced
natively, and converting would have duplicated the checkbox's animated SVG into
this component where it would drift. The substantive defects — no accessible
name, no keyboard path, no tests — are fixed, which is what the item was
actually for. Worth a second opinion if you disagree; it is a one-file change
to revisit.

`packages/angular/prototypes/tag-input/` is unusually ready: a full spec, a
behaviour-complete vanilla prototype, and `test.mjs` asserting 32 behaviours
that port more or less directly into the Vitest spec. The ship checklist at the
end of `SPEC.md` is accurate; follow it.

**Decide before writing code — SPEC.md open question 4.** Multi-select combobox
and tag input are ~80% the same widget, and `TODO.md` lists "Combobox /
autocomplete" (form-bound, object options) as a separate Tier 2 item. Deciding
now whether `uni-tag-input` *is* the multi-select combobox determines its API;
deciding later means either a second overlapping component or a breaking change
to this one. The other three open questions (the `tone` axis, Space as a
separator, local filtering) can be settled during implementation.

#### Decision brief (Q4)

**The axis that matters is open vs. closed set, not chips vs. no chips.** A
multi-select combobox picks from a *closed* list — every value corresponds to
an option, and the option list is the source of truth, so the value can stay
`T[]` of keys. A tag input accepts *open* values: SPEC.md is explicit that a
typo'd address stays in the value as an invalid chip. That forces the value to
carry its own label and metadata (`UniTagItem`), because an entry may have no
matching option — and it is what makes `validate`, `parse`, `separators` and
`rejected` meaningful. Those five API members are dead weight in a closed-set
control. One component covering both means one of the two use cases carries an
API it can never use.

**What already exists** (nothing here renders selected values as chips, and
`uni-tag` currently has zero consumers):

| | value | forms | ARIA combobox | specs |
|---|---|---|---|---|
| `search-input` | `string` | ✗ | **✓ complete** | 5 tests |
| `select-input` | `T \| null` key | ✓ | ✗ (native select) | 2 tests |
| `multi-select-dropdown` | `T[]` keys | ✓ | ✗ (`haspopup=dialog` + checkboxes) | **none** |
| proposed `tag-input` | `UniTagItem[]` | ✓ | ✓ (spec'd) | 32 prototype behaviours |

**Recommended: keep them separate, but do not build a third component.** Build
`uni-tag-input` as specced (open set, its own value type), and satisfy the
roadmap's combobox item by *upgrading `multi-select-dropdown`* rather than
adding a new control — it is already `T[]` + `FormValueControl` with internal
filtering, and it is the weakest component in the library on exactly the axes a
combobox needs (no `role="combobox"`, no `aria-activedescendant`, no accessible
name on its trigger, zero specs). That closes a real quality gap instead of
opening a new surface.

**Do this while building, or the split becomes divergence:** extract the
listbox behaviour — active-descendant tracking, arrow/Home/End traversal,
open/close, the `role="listbox"`/`role="option"` markup — into a shared CDK
piece that `search-input`, `tag-input` and the upgraded `multi-select-dropdown`
all use. Three hand-rolled copies of the combobox keyboard contract is the same
trap that produced four overlapping theme tools.

**Flag regardless of the decision — option shapes are proliferating.** The
library would carry four: `Option<T> = {label, value}` (select, multi-select),
bare `string` (search-input suggestions), `UniTagSuggestion = {value, label?,
description?, avatarSrc?}` and `UniTagItem` (both proposed). `UniTagSuggestion`
inverts `Option<T>`'s required field — `value` required, `label` optional —
which is defensible for tags but means two option types disagree about which
half is mandatory. Worth reconciling to one generic shape before a second
component depends on the new one.

**Sequencing notes.**
- `uni-tag` v2 is a breaking change (`close` → `removed`): major changeset for
  uni-angular, plus the codemod the checklist calls for.
- `'tag'` and `'tagInput'` join `ComponentName` in core — a core minor, same
  shape as the `menu`/`menuItem` work.
- The 32 prototype behaviours are the spec backbone; the keyboard map and the
  ARIA contract both need coverage, per `AGENTS.md`.

---

## 2b. Storybook navigation ✅ DONE 2026-08-11

Retitled all 68 stories into four top-level sections (`Core · Components ·
Utilities · Experiments`) with eight purpose-based groups under Components, and
named all 67 MDX pages after their component so each renders as **one flat
sidebar item** instead of a folder containing a `Docs` child. Added the two
missing Experiments pages (that section rendered nothing before), and a
`scripts/check-doc-links.mjs` guard wired to the build — it caught 3 links that
were already dead plus the 19 the retitling moved.

**Undocumented components — follow-up work.** These are real exported
components with no story and no MDX, so they are invisible in the sidebar no
matter how it is organized:

- `components/dropdown` — `UniDropdownComponent`, the popover primitive behind
  menu and multi-select
- `components/notifications/confirmation-dialog` — `UniConfirmationDialogComponent`
- `components/notifications/notifications` — `UniNotificationsComponent`, which
  the Utilities/Notifications page tells you to place in your layout

Also undocumented: `src/lib/directives/` (body-render, drag-and-drop, ripple)
has no sidebar presence at all.

## 3. Table-stakes gaps

The old build order (textarea → tabs → avatar → skeleton → drawer + app bar) is
**complete**; 53 components ship. Still missing from `TODO.md` Tier 2 and
ROADMAP Track 2 item 2, in rough leverage order:

1. **Date picker + calendar** — biggest single build (grid keyboard nav,
   locale, range later), and the most-requested control anywhere. Plan it
   properly rather than starting it opportunistically.
2. **List** — the "settings screen" primitive; small next to the date picker and
   unblocks a lot of app surface.
3. **Stepper**, **number input**, **spinner**, **tree**.
4. **Footer** — declared in `ComponentName` but never built; either build it or
   drop the declaration so the type stops lying.
5. **Virtual scroll**, which currently caps `data-table`.

---

## 4. Library health — what "for human use" actually requires

These are not features, and they are what separates a library people adopt from
one they evaluate and leave.

- **Test depth** (ROADMAP Track 2 item 5). 51% of specs are smoke-only and the
  most complex components — `data-table`, `paginator`, `popover`,
  `multi-select-dropdown`, `sort-header` — have **zero** specs. That is where
  behavioural regressions will come from. Highest-value non-feature work
  available.
- **i18n** (item 3). Hardcoded English strings (`aria-label="Pagination"`,
  dialog "Close") are a hard blocker for non-English deployment.
- **RTL below the token layer** (item 4). Physical properties throughout
  (dialog close `right: 12`, toggle `translateX`, select arrow `right: 0`).
  Systematic sweep to logical properties.
- **React package credibility** (item 1). ~8 components against Angular's 53,
  zero tests, TS errors on main, third-party runtime deps against the zero-dep
  policy. Fix, de-publish, or mark experimental — leaving it published as-is
  costs trust in the Angular package.

---

## 5. MCP — parked, with the loose ends written down

Nothing here blocks section 1–4 work. Revisit when the component pipeline has
room.

- **`pnpm build-index` is stale.** `src/data/uni-index.json` was built
  2026-07-30 against Uni 7.2.0 and does not know about the `menu`/`menuItem`
  theme entries or anything built since. The release flow runs it under
  `version-packages`, so it self-corrects at release — but any MCP answer given
  before then is out of date.
- **Version skew**: `uni-mcp` is 4.5.0 while the index reports Uni 7.2.0. Two
  version numbers in one server confuse anyone reading `/health`.
- **Remaining Track 1 items**: structured output for the other 10 tools (item
  6 — the two new tools are the template); slot/content-projection metadata
  (item 5) so agents can compose layouts, not just configure components;
  `ThemeConfig` typography/spacing fields (item 2); runtime WCAG assertion in
  `parseTheme`; responsive primitives (item 7).
- **Serving the showcase themes.** Carbon and Wellsourced live in
  `packages/angular/src/stories/themes/` and so are invisible to the MCP and the
  registry endpoint. Moving them somewhere shared would make
  `GET /themes/CarbonLight.json` work and give the registry channel more than
  two entries.
- **Deploy note**: the Render service serves the committed index and the
  build-time snapshot of core, so theme JSON changes ship only on redeploy.

---

## Suggested order

~~1a (menu fix)~~ ✅ → ~~1b (tag characterization)~~ ✅ → **decide SPEC.md Q4**
← next, and it is a decision, not a build → 2 (tag + tag-input) → 4's
test-depth sweep on the zero-spec components → 3 (date picker, planned
deliberately).
