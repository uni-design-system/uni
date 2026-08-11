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

## 2. Next component — `uni-tag` v2 + `uni-tag-input`

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

**Sequencing notes.**
- `uni-tag` v2 is a breaking change (`close` → `removed`): major changeset for
  uni-angular, plus the codemod the checklist calls for.
- `'tag'` and `'tagInput'` join `ComponentName` in core — a core minor, same
  shape as the `menu`/`menuItem` work.
- The 32 prototype behaviours are the spec backbone; the keyboard map and the
  ARIA contract both need coverage, per `AGENTS.md`.

---

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
