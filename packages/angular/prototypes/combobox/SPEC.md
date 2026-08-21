# Combobox — design spec

Status: **proposal / prototype**  ·  Target: `@uni-design-system/uni-angular`
Prototype: [`index.html`](./index.html) (open in a browser, no build step)

`uni-combobox` closes the roadmap's "Combobox / autocomplete" item: the
**form-bound, closed-set, single-select** autocomplete. `uni-search-input`
already implements the ARIA combobox *pattern* (2026-07-24) but its value is a
query string and its semantics are search — magnifier, submit-on-Enter,
Escape-clears. What's missing is the same interaction contract with **select
semantics**: object `Options<T>`, `FormValueControl<T | null>`, commit-on-select,
a real accessible label, no search affordances.

One component, plus two small CDK amendments it forces:

1. **`uni-combobox`** — the control.
2. **`Option<T>` grows two optional fields** (`description`, `disabled`) —
   reconciling the option-shape proliferation flagged in ACTION-PLAN.md instead
   of adding a fifth shape.
3. **`ListboxNavigation` learns to skip disabled options** — a `disabled?`
   config hook; every existing consumer is unaffected.

---

## Where it sits (and why it isn't a fourth overlap)

The 2026-08-11 decision brief settled the *multi*-select axis: open set →
`uni-tag-input`, closed multi set → `multi-select-dropdown`. This fills the
remaining cell — closed **single** set with typing. `uni-select` stays: it is
the native, zero-JS, mobile-friendly answer for short lists.

| | value | set | typing | popup |
|---|---|---|---|---|
| `uni-select` | `T \| null` | closed | ✗ | native picker |
| **`uni-combobox`** | **`T \| null`** | **closed** | **✓ filters** | **listbox** |
| `uni-search-input` | query `string` | open | ✓ queries | listbox |
| `uni-tag-input` | `UniTagItem[]` | open | ✓ creates | listbox |
| `multi-select-dropdown` | `T[]` | closed | ✓ filters | checkbox dialog |

**When-to-use rule for the MDX:** under ~10 options and no need to type →
`uni-select`. More options, or users know what they're looking for →
`uni-combobox`. The value contract is identical (`T | null`, `compareWith`), so
swapping one for the other as a list grows is a template-only change — that is
deliberate.

## Anatomy

```
        ┌──────────────────────────────────────────────┐
        │  Alabama                              ✕   ⌄ │   ← uni-input-box chrome
        └──────────────────────────────────────────────┘
        ┌──────────────────────────────────────────────┐
        │  Alabama                      Montgomery  ✓  │   ← committed: aria-selected
        │  Alaska                           Juneau     │
        │  Arizona                         Phoenix     │   ← active: highlight only
        │  Arkansas                    Little Rock     │
        │  ⋮  (scrolls at maxVisibleOptions rows)      │
        └──────────────────────────────────────────────┘
           ▲                                  ▲    ▲
           │                                  │    └ toggle (pointer affordance)
           │                                  └ clear (shown while a value is set)
           └ option label · description · check on the committed option
```

No magnifier, no "Search…" placeholder default, nothing submits. The trailing
affordance is the select language: a chevron.

## Value model

```ts
export class UniComboboxComponent<T> implements FormValueControl<T | null>
```

- `value` is the **option's `value`**, never its label and never the draft
  text. Typing produces a *draft* — a filter, not a value. The value changes
  on exactly three paths: an option commits, `clear()` runs, or the model is
  written from outside.
- The field displays the committed option's `label` (resolved via
  `compareWith`, same contract and same doc-comment as `uni-select`). A value
  with no matching option renders an empty field but is **preserved** — the
  control never nulls a model it merely can't display (options may still be
  loading).
- Draft text is never emitted through `value`. Apps that want the raw text
  (e.g. to offer "create …") listen to `query`.

## API

Selector: `uni-combobox, Combobox` (canonical + short alias, per convention).

```ts
// Signal Forms block (explicit, per AGENTS.md — not extracted to a base class)
readonly value = model<T | null>(null);
readonly disabled = input(false);
readonly touched = model(false);
readonly invalid = input(false);
readonly dirty = input(false);
readonly required = input(false);
readonly ariaDescribedBy = input<string>();

// Configuration
label       = input.required<string>();     // accessible name, e.g. "State"
placeholder = input<string>();
options     = input<Options<T>>([]);        // the cdk shape — see below
compareWith = input<(optionValue: T, value: T) => boolean>((a, b) => a === b);
width       = input<string | number>('100%');
clearable   = input(true);                  // ✕ while a value is set
commitOnBlur= input(true);                  // blur commits an exact-match draft
emptyText   = input('No matches');          // i18n-able empty row

// Filtering (local by default — the closed set is already in memory)
filterLocally = input(true);
filterWith  = input<(option: Option<T>, query: string) => boolean>();
              // default: locale-lowercased label-contains
query       = output<string>();             // debounced draft text, for async lists
debounceTime= input(250);

// Events
selected = output<Option<T>>();             // an option committed
cleared  = output<void>();
rejected = output<{ query: string }>();     // a commit was refused (no match)
```

Minimum agent-writable usage is one line:
`<uni-combobox label="State" [options]="states" [(value)]="state" />`.

> **Filtering ownership — decided (2026-08-21, GE): local by default.** This
> deliberately diverges from `search-input`/`tag-input`, where the *app*
> filters suggestions. Those are open-set controls whose option universe lives
> app-side; a combobox's whole option list is already in the `options` input,
> so making every consumer wire `(query)` → filter → `[options]` would be
> boilerplate with one correct answer. The open-set contract remains available:
> `filterLocally=false` renders `options` verbatim and the app narrows them
> from `query` — that is the async/server-side story, and it is byte-for-byte
> the search-input contract.

### `Option<T>` — extended, not forked

```ts
export interface Option<T = unknown> {
  label: string;
  value: T;
  description?: string;   // NEW — secondary line, e.g. an email under a name
  disabled?: boolean;     // NEW — visible, announced, not committable
}
```

Decided 2026-08-21 (GE): extend the canonical shape rather than introduce a
`UniComboboxOption<T>`. Non-breaking — both fields optional; `uni-select` and
`multi-select` ignore them today and can adopt `disabled` later (native
`<option disabled>` is a one-line upgrade). ACTION-PLAN.md's "option shapes are
proliferating" flag is the reason this is a cdk change and not a local type.

## Interaction contract

### The draft

Typing never selects. The field holds either the **committed label** or a
**draft**; the draft exists from the first keystroke until it commits, reverts,
or is edited back into equality with the committed label. Filtering is
instant (in-memory); only the `query` output is debounced.

Draft resolution — used by `Enter`, `Tab`, and blur:

1. An **active option** in the list → commit it.
2. Else a **unique exact label match** (locale-case-insensitive) → commit it.
3. `Enter` only: the filter has narrowed to **exactly one enabled option** →
   commit it. (Typing `alab` + Enter commits Alabama without arrowing down.)
4. Else: `Enter` keeps the list open and announces the empty/ambiguous state;
   `Tab`/blur **revert** the field to the committed label and emit
   `rejected({ query })` if the draft was non-empty.

Rule 3 is Enter-only on purpose: on Enter the user is looking at the list and
can see there's one candidate; on blur they're already gone, and committing a
value they never saw confirmed is how forms grow mystery data.

### Opening

| Trigger | List shows | Active option |
|---|---|---|
| typing | filtered set | none (rule 2/3 make Enter still work) |
| `ArrowDown` (closed) | full set | committed option, else first enabled |
| `ArrowUp` (closed) | full set | last enabled |
| `Alt+ArrowDown` | full set | none |
| pointer click on the field / toggle | full set | committed option |

Opening on **focus** is deliberately not a behaviour: Tab-through forms must
not spray popups. Opening on **click** is: pointer users get the
browse-a-list affordance that makes this feel like a select, with the
committed option highlighted and scrolled into view.

### Keyboard map (focus is in the input — the only tab stop)

| Key | Behaviour |
|---|---|
| printable | edits the draft, filters, opens the list |
| `ArrowDown` / `ArrowUp` | opens if closed; moves through **enabled** options, wrapping |
| `Alt+ArrowDown` / `Alt+ArrowUp` | opens without activating / closes, keeping the draft |
| `Home` / `End` | first / last enabled option while the list is open (see open q. 3) |
| `Enter` | draft resolution above; never submits a form while the list is open |
| `Escape` | closes the list; if already closed, reverts the draft to the committed label. **Never clears the committed value** — Escape on a form control must not be destructive (contrast: search-input, where Escape-clears is correct because the value *is* the query) |
| `Tab` | draft resolution (rules 1–2), then moves on — never traps |
| blur | same as Tab when `commitOnBlur`; marks `touched` |

The clear ✕ is a real named button (`Clear {{label}}`), tab-reachable —
unlike tag-input's per-chip ✕ there is only ever one, so it doesn't bloat the
tab order and gives keyboard users a discoverable clear path. The chevron
toggle is `tabindex="-1"` `aria-hidden="true"`: a pointer-only affordance;
keyboard already has ArrowDown, and the input itself announces expanded state
(APG's editable-combobox stance).

### States

| State | Visual | ARIA |
|---|---|---|
| rest / focus / error / disabled | from `uni-input-box` — not duplicated | `aria-invalid` gated on `invalid && (touched \|\| dirty)` |
| open | chevron rotates 180° | `aria-expanded="true"` |
| active option | container highlight (as search-input) | `aria-activedescendant` |
| committed option | check symbol, `selectedColor` text | `aria-selected="true"` |
| disabled option | `on-disabled` text, no hover, arrows skip it | `aria-disabled="true"` |
| empty filter | non-interactive `emptyText` row | announced via live region |

`aria-selected` marks the **committed** option, not the active one — they are
different facts and this control has both. (search-input marks the active row
because it has no committed concept; that stays as-is.)

## ARIA contract

- The input is `role="combobox"` with `aria-autocomplete="list"`,
  `aria-expanded`, `aria-controls` and `aria-activedescendant` — the shared
  `ListboxNavigation` contract, fourth consumer.
- `label` is applied as the input's accessible name and echoed as the
  listbox's `aria-label` (library-wide convention; visible `<label for>`
  rendering remains the app's design decision).
- A `role="status"` live region announces commits (*"Alabama selected."*),
  clears (*"Selection cleared."*), refusals, and — debounced with the query —
  result counts (*"4 results."* / *"No matches."*). Filtering is otherwise
  silent to a screen reader.
- Option `description` is part of the option's text content, so it is read as
  part of the option's name (*"Alaska, Juneau"*); the committed check symbol
  is `aria-hidden` — selection is carried by `aria-selected`.
- `required` → `aria-required`; `ariaDescribedBy` passes through for
  app-rendered errors, per the form-control rule.

## CDK change: skipping disabled options

`ListboxNavigation` today navigates by count and cannot skip. Add one optional
config hook:

```ts
export interface ListboxNavigationConfig {
  count: () => number;
  idPrefix?: string;
  wrap?: boolean;
  /** Non-navigable options. Arrows step over them; Home/End land on the
      nearest enabled option; an all-disabled list never activates. */
  disabled?: (index: number) => boolean;   // NEW, default () => false
}
```

`nextIndex` keeps stepping (respecting `wrap`) while the candidate is
disabled; `Home`/`End` walk inward. No existing consumer passes it, so
search-input / tag-input / time-input / multi-select are untouched — but
multi-select gets option-disabling for free the day it wants it.

## Theme entry

Add `'combobox'` to `ComponentName` and register:

```ts
combobox: {
  options: {
    toggleSymbol: 'keyboard_arrow_down',
    clearSymbol: 'close',
    selectedSymbol: 'check',
    listColor: 'primary-surface',
    listShadow: 'menu',
    listBorderRadius: 'xs',
    maxVisibleOptions: 8,     // list *scrolls* past this — never truncates
    descriptionColor: 'on-primary-surface-variant',
  },
}
```

`maxVisibleOptions` is a scroll height, not a cap — a closed-set control must
never render a reachable-by-keyboard-only subset (contrast `searchInput`'s
`maxSuggestions`, which genuinely truncates an open suggestion stream). Field
chrome comes from `input` via `uni-input-box`, as everywhere.

## Out of scope (v1)

- **Multi-select** — that axis was settled 2026-08-11 (`multi-select-dropdown`
  / `uni-tag-input`).
- **Free-text / "create new" values** — that's an open set; use
  `uni-tag-input`'s machinery or listen to `rejected` app-side. Bolting
  `allowCustom` onto a closed-set control reopens exactly the API-dead-weight
  problem the decision brief closed.
- **Option groups** (`<optgroup>` equivalent) — real, deferred; needs a
  `role="group"` story in the shared listbox first.
- **Virtualized lists** — hundreds of options render fine; thousands is a
  different component contract.

## What the prototype proves

`index.html` is behaviour-complete for everything above; `test.mjs`
(Playwright, `node test.mjs`) drives it headlessly and asserts **41
behaviours** — worth porting straight into the Vitest spec:

- type-to-filter with instant narrowing; commit via click, Enter-on-active,
  exact-match Enter, and unique-filtered Enter (rule 3)
- blur commits exact matches only; a non-matching draft reverts and fires
  `rejected`; Escape ladder (close → revert) and that Escape never clears
- ArrowDown on a committed value opens with that option active and scrolled
  into view; disabled options are skipped and announced; wrap-around
- clear button: shown only with a value, clears to null, refocuses, announces
- `filterLocally=false` instance: options pass through verbatim, `query`
  emits debounced, spinner-free async narrowing works
- `aria-expanded` / `aria-activedescendant` / `aria-selected`-on-committed
  wiring; live-region commit and count announcements
- `showError()` gating: invalid renders only after touch

## Open questions

1. **`displayWith`?** A value with no matching option renders an empty field.
   Material solves this with a `displayWith` function; we could too, but it
   only matters when options load after the value — and the field self-heals
   when they arrive. Leaning: leave it out until a real consumer hits it.
2. **Should `query` emit at all when `filterLocally` is on?** Spec says yes
   (it's how an app lazily *appends* options while local filter handles
   display). Costless, but it's an API surface someone will misread as "I must
   handle this".
3. **`Home`/`End` steal caret movement** while the list is open — inherited
   from the shared `ListboxNavigation` contract (search-input shipped it).
   APG's editable-combobox pattern reserves Home/End for the caret. If we
   revisit, it should change in the CDK for all four consumers at once, not
   here.
4. **Popup positioning** — absolute-positioned under the field, like
   search-input, which clips inside `overflow: hidden` ancestors. The library
   has CSS Anchor Positioning helpers; migrating all the listbox popups to
   `popover="auto"` + anchor is a cross-cutting upgrade worth its own item.

## Checklist to ship (per `packages/angular/AGENTS.md`)

- [ ] cdk: `Option<T>` gains `description?`/`disabled?`; `ListboxNavigation`
      gains `disabled` hook + specs (skip, wrap-skip, Home/End walk, all-disabled)
- [ ] `'combobox'` in `ComponentName`; theme entry in `base.theme.ts`
- [ ] `combobox/` component + model + barrel; export from `components/index.ts`
- [ ] Specs covering the keyboard map, draft resolution rules 1–4, **and** the
      ARIA contract (port from `test.mjs`)
- [ ] `.stories.ts` + `.mdx` (Overview with the select-vs-combobox rule /
      Usage / Async via `filterLocally=false` / Disabled options / Theme
      options / Accessibility / Do / Don't)
- [ ] `ACCESSIBILITY.md`: keyboard map + the Escape-never-clears note
- [ ] `uni-select` MDX: add the "when your list outgrows this" pointer
- [ ] `pnpm lint && pnpm test && pnpm build && pnpm docs:api`
