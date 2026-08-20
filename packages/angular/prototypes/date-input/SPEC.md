# Calendar, Date & Time Input — design spec

Status: **proposal / prototype**  ·  Target: `@uni-design-system/uni-angular`
Prototype: [`index.html`](./index.html) (open in a browser, no build step)

Four deliverables, one dependency chain:

1. **`uni-calendar`** — an inline month grid, a form control in its own right.
   Selection modes: single date and start–end range. Days can carry
   **markers** (availability dots) driven by app data — the scheduling
   pattern is the first application.
2. **`uni-date-input`** — a text field with free-typed parsing and a popup
   `uni-calendar`. Type `aug 20` or pick from the grid; the form gets the
   same canonical value either way.
3. **`uni-time-input`** — a combobox over time slots. Type `3p` or pick
   `3:00 PM` from the list; the form gets `15:00`.
4. **`uni-date-time-input`** — a thin composer that seats a date and a time
   input in one field chrome and yields one combined value. Date and time
   stay independent components; this is the "easy way to compose them".

---

## Why not `<input type="date">`

The library is native-platform-first, so the burden of proof is on *not*
using the platform control. It fails four requirements at once:

- **The popup is unstylable and inconsistent** — no theme tokens, no dark
  mode parity, a different widget on every OS/browser.
- **No range selection**, no way to mark days (availability, capacity),
  no min/max UI beyond silently refusing.
- **Its displayed format is the OS locale's and only that** — the app can't
  choose `20 Aug 2026` over `08/20/2026`.
- **`showPicker()` needs a user gesture and can't be intercepted**, so the
  scheduling flow (pick a day → load slots → pick a slot) can't be built on it.

What we keep from the platform: the native **popover** top layer and CSS
Anchor Positioning for the popup (same machinery as `uni-popover` and
`uni-menu`), real `<button>`s for every day cell, and `Intl` for all
formatting and parsing — **zero runtime dependencies, no date library.**

## Value shapes — strings, not `Date`s

```ts
export type UniDate = string;                     // 'YYYY-MM-DD'
export type UniTime = string;                     // 'HH:mm' (24h)
export type UniDateTime = string;                 // 'YYYY-MM-DDTHH:mm'
export interface UniDateRange { start?: UniDate; end?: UniDate }
```

A JS `Date` is a timestamp with a timezone problem: constructing
`new Date('2026-08-20')` yields midnight **UTC**, which is 19 Aug in
Honolulu — the classic off-by-one that every `Date`-valued picker ships.
A calendar date is not an instant; it's a label on a wall calendar.
Plain ISO strings are timezone-free, JSON-serializable, sortable with `<`,
diffable in specs, and the cheapest thing for an agent to write:
`[value]="'2026-08-20'"` is a complete, correct binding.

Zoned scheduling ("9:00 in the clinic's timezone") is the **app's** concern —
it owns the zone and converts at the edge. The components never touch
`Date.getTimezoneOffset()`.

---

## Part 1 — `uni-calendar`

### Anatomy

```
┌──────────────────────────────────────────────┐
│   ‹        August 2026        ›              │  ← nav: prev / heading (live) / next
│   Mo   Tu   We   Th   Fr   Sa   Su           │  ← weekday header row (columnheaders)
│                          1    2              │
│   3    4    5    6    7    8    9            │
│  10   11  [12]  13   14   15   16            │  ← selected day
│  17   18   19  (20)  21   22   23            │  ← today (outlined)
│  24   25   26   27   28   29   30            │
│  31  ·                                       │  ← markers: availability dots
└──────────────────────────────────────────────┘
```

One month per instance. Every day is a real `<button>` inside a
`role="gridcell"`; the grid is one tab stop with roving `tabindex`
(same rule as tag-input's chips: Tab crosses the widget, arrows move
inside it).

### API

```ts
// Signal Forms block (explicit, per AGENTS.md — the calendar is a form control)
value = model<UniDate | UniDateRange | undefined>();
disabled = input(false); touched = model(false); invalid = input(false);
dirty = input(false); required = input(false); ariaDescribedBy = input<string>();

// Configuration
mode        = input<'single' | 'range'>('single');
month       = model<string>();                  // 'YYYY-MM' shown month — two-way,
                                                // so an app can drive "jump to June"
min         = input<UniDate>();
max         = input<UniDate>();
disabledDates = input<UniDate[] | ((date: UniDate) => boolean)>();
markers     = input<UniCalendarMarker[]>([]);   // { date, variant?, label? }
locale      = input<string>();                  // default: document lang → navigator
weekStart   = input<0|1|2|3|4|5|6>();           // default: Intl.Locale weekInfo
size        = input<Size>('md');                // 'sm' | 'md' | 'lg'
ariaLabel   = input<string>();                  // names the grid when standalone

// Events (value/month changes flow through the models)
selected = output<UniDate>();                   // each committed day, incl. range ends
```

```ts
export interface UniCalendarMarker {
  date: UniDate;
  variant?: Variant;      // dot color role, default 'primary'
  label?: string;         // sr-only suffix, e.g. "3 slots open"
}
```

`mode` switches the value shape: `'single'` reads/writes `UniDate`,
`'range'` reads/writes `UniDateRange`. One component, one grid, one
keyboard map — the alternative (a separate `uni-range-calendar`) would
duplicate all three to change only the commit step.

### Range interaction

First commit sets `{ start }` (pending); moving focus or hovering paints a
preview from `start` to the candidate; the second commit sets `end`.
Committing a day **before** `start` swaps the ends rather than erroring —
the user pointed at the range they meant. `Escape` cancels a pending range
and restores the previous value. A pending range announces
*"Start date 20 August. Choose an end date."* through the live region,
because the preview paint is invisible to a screen reader.

### Keyboard map (focus inside the grid)

| Key | Behaviour |
|---|---|
| `ArrowLeft` / `ArrowRight` | previous / next day (crosses month edges, grid follows) |
| `ArrowUp` / `ArrowDown` | same weekday, previous / next week |
| `Home` / `End` | first / last day of the focused week |
| `PageUp` / `PageDown` | same day, previous / next month |
| `Shift+PageUp` / `Shift+PageDown` | same day, previous / next year |
| `Enter` / `Space` | selects the focused day (in `range` mode: start, then end) |
| `Escape` | cancels a pending range; inside a popup, closes it |

Arrow moves that land on a disabled day keep going in the same direction
until an enabled day or the `min`/`max` fence; the fence stops the caret,
it never wraps. Navigation is never blocked by month edges — the heading
and grid follow the focused day.

### States

| State | Visual | ARIA |
|---|---|---|
| rest | day button, transparent | — |
| hover / focused day | `primary-container` tint, focus ring on the day only | roving `tabindex="0"` |
| today | 1px outline in `primary`, never fill | `aria-current="date"` |
| selected | solid `primary` fill | `aria-selected="true"` on the gridcell |
| in range (between ends) | `primary-container` band, square corners | `aria-selected="true"` |
| range preview | same band at reduced strength, dashed edge | — (announced via live region) |
| marked | dot(s) under the day number in the marker variant | marker `label` appended to the day's name |
| disabled / out of `min`/`max` | `on-disabled` text, no pointer events | `disabled` (skipped by arrows) |
| outside month | hidden by default (`showOutsideDays` theme option shows them muted, non-interactive) | `aria-hidden` |

Today is an **outline** and selection is a **fill** so the two can coincide
on one day and both stay legible; a marker dot survives selection by
switching to the on-color. None of the three states is carried by colour
alone (shape: outline vs fill vs dot — WCAG 1.4.1).

### Theme entry

Add `'calendar'` to `ComponentName` and register:

```ts
calendar: {
  options: {
    dayBorderRadius: 'max',    // 'xxs' gives the square/GitHub-contributions look
    typeface: 'label',
    gap: 'xxs',                // grid gutter
    navPrevSymbol: 'chevron_left',
    navNextSymbol: 'chevron_right',
    weekdayFormat: 'short',    // Intl weekday: 'narrow' | 'short'
    showOutsideDays: false,
    todayStyle: 'outline',     // 'outline' | 'dot'
  },
  fixed: {
    display: 'inline-block',
    userSelect: 'none',
  },
  // Geometry only, like tag: day cell square + font size per size token.
  sizes: {
    sm: { day: 28, fontSize: 12 },
    md: { day: 34, fontSize: 13 },
    lg: { day: 40, fontSize: 15 },
  },
}
```

Selection/range/today colours are **not** options — they are the `primary`
role pair, so a theme restyles them by restyling its palette, the same rule
every other component follows.

> **Alternative considered:** `months = input<1 | 2>()` for a dual-pane
> range calendar (the booking pattern). Deferred — it doubles the grid,
> nav, and focus bookkeeping for a layout only wide viewports want, and
> range selection already works across month edges in one pane. Revisit
> when a booking use case lands.

### Accessibility contract

- The month grid is `role="grid"` with an `aria-labelledby` pointing at the
  month heading; weekday cells are `role="columnheader"` with an `abbr`
  carrying the full weekday name.
- Each day is a `<button>` in a `role="gridcell"`; its accessible name is
  the full date (*"Thursday 20 August 2026"*), plus the marker `label`
  when present (*"… 3 slots open"*). Numbers alone are never the name.
- **One tab stop.** Roving `tabindex` inside the grid; prev/next month are
  real `icon-button`s before the grid, named *"Previous month"* /
  *"Next month"*.
- The month heading is `aria-live="polite"`, so PageUp/Down narrates
  *"September 2026"* without refocusing.
- Selections and range progress announce through one `role="status"` region
  per calendar: *"20 August 2026 selected."*, *"Start date 20 August.
  Choose an end date."*, *"Range selected, 20 to 24 August 2026. 5 days."*
- `showError()` gates `aria-invalid` on `invalid && (touched || dirty)`,
  per the library's form-control rule.

---

## Part 2 — `uni-date-input`

### Anatomy

```
┌──────────────────────────────────┬─────┐
│ Aug 20, 2026                     │  ▦  │   ← input-box chrome; ▦ toggles the popup
└──────────────────────────────────┴─────┘
        ┌───────────────────────────┐
        │       uni-calendar        │        ← native popover, anchor-positioned
        └───────────────────────────┘
```

Chrome is `uni-input-box`, so error/disabled/focus states come free and stay
consistent with every other field. The popup is the **same `uni-calendar`
instance** the app could render inline — one grid to test, theme, and learn.

### API

```ts
// Signal Forms block (explicit per AGENTS.md)
value = model<UniDate | undefined>();
disabled = input(false); touched = model(false); invalid = input(false);
dirty = input(false); required = input(false); ariaDescribedBy = input<string>();

// Configuration
label        = input.required<string>();        // "Appointment date"
placeholder  = input<string>();                 // default: locale pattern, e.g. "MM/DD/YYYY"
displayFormat= input<Intl.DateTimeFormatOptions>({ dateStyle: 'medium' });
locale       = input<string>();
commitOnBlur = input(true);
parse        = input<(raw: string, locale: string) => UniDate | null>();

// Forwarded to the popup calendar
min = input<UniDate>(); max = input<UniDate>();
disabledDates = input<UniDate[] | ((date: UniDate) => boolean)>();
markers = input<UniCalendarMarker[]>([]);
weekStart = input<0|1|2|3|4|5|6>();

// Events
opened   = output<void>();                      // popup shown / hidden
closed   = output<void>();
rejected = output<{ raw: string; reason: 'unparseable' | 'out-of-range' | 'disabled' }>();
```

### Typed entry — parse on commit, not a mask

The field is free text, parsed on `Enter` / blur, then re-rendered in
`displayFormat`. Input masks were rejected: they fight paste, IMEs, and
screen-reader echo, and they hard-code one digit order in a locale-aware
library. The default parser accepts, in order:

1. **ISO** — `2026-08-20` (what agents and APIs write)
2. **Locale numeric** — `8/20/2026`, `20.8.2026`, `08-20` … digit order
   inferred from `Intl.DateTimeFormat(locale).formatToParts()`, not hardcoded
3. **Month name** — `aug 20`, `20 aug 2026`, `August 20th` (matched against
   the locale's own month names, long and short)

A missing year resolves to the **next occurrence** (typing `mar 1` in
August 2026 means 1 Mar 2027 — nobody schedules into the past); `min`/`max`
can override that bias. Two-digit years are refused rather than guessed.

Unparseable text **stays in the field**, styled invalid, with a `rejected`
event — the same principle as tag-input: a field that silently swallows
`aug 32` is worse than one that shows it in red. Out-of-range and
disabled-date commits are refused the same way, with the reason announced.

### Keyboard map (focus in the text field)

| Key | Behaviour |
|---|---|
| printable | free text entry (no mask) |
| `Enter` | parses and commits; reformats to `displayFormat` |
| `Tab` | commits typed text, then moves on — never traps |
| `Alt+ArrowDown` | opens the popup, focus moves to the selected day (or today) |
| `ArrowDown` on an **empty** field | opens the popup |
| `ArrowUp` / `ArrowDown` on a **committed** value | steps the date ±1 day (the caret has nowhere to go; stepping is what a spinner would do) |
| `Escape` | reverts uncommitted text to the committed value |
| blur | commits typed text when `commitOnBlur`, marks touched |

**Focus inside the popup** — the calendar's own map, plus: `Enter`/`Space`
selects, closes the popup, and returns focus to the field; `Escape` closes
without selecting and returns focus; `Tab` does not leave the popup while
it is open (it is a focus-holding dialog, per the APG date-picker pattern).

### ARIA contract

- The text input is a plain `<input>` (not a combobox — there is no
  filtering-a-list relationship). The popup toggle is a real `icon-button`
  named from the value: *"Choose date"* / *"Change date, 20 August 2026"*,
  with `aria-haspopup="dialog"` and `aria-expanded`.
- The popup is a native `popover` with `role="dialog"`, labelled
  *"Choose date"*; light-dismiss (outside click / `Escape`) is the native
  behaviour, and focus returns to the field on close.
- Commits, steps, and rejections announce through `role="status"`:
  *"20 August 2026."* / *"Couldn't read 'aug 32' as a date."* — the
  reformat-on-commit is otherwise a silent visual.
- `aria-invalid` gated by `showError()`; an unparseable draft shows its
  invalid styling immediately (it describes text just typed) but only sets
  `aria-invalid` once committed-and-failed, mirroring tag-input's split
  between field-level and token-level validity.

---

## Part 3 — `uni-time-input`

A combobox over time options — the same listbox contract as
`uni-search-input` and `uni-tag-input` (shared `ListboxNavigation`), so the
pattern is learned once. The list is **assistive, not exhaustive**: any
parseable time can be typed even if it isn't listed (unless `slots` pins
the choices).

### API

```ts
// Signal Forms block
value = model<UniTime | undefined>();
disabled = input(false); touched = model(false); invalid = input(false);
dirty = input(false); required = input(false); ariaDescribedBy = input<string>();

// Configuration
label      = input.required<string>();          // "Start time"
placeholder= input<string>();
minuteStep = input(30);                         // generated list granularity
min        = input<UniTime>();                  // '09:00'
max        = input<UniTime>();                  // '17:00'
slots      = input<UniTime[]>();                // exact allowed times (scheduling);
                                                // when set, typed entry must match one
hour12     = input<boolean>();                  // display; default from locale
commitOnBlur = input(true);

// Events
rejected = output<{ raw: string; reason: 'unparseable' | 'out-of-range' | 'unavailable' }>();
```

The canonical value is always 24-hour `'HH:mm'`; `hour12` only affects
display and the option labels. With `slots` set the component becomes a
slot picker: the list shows exactly the given times and a typed `3pm`
commits only if `15:00` is among them (`reason: 'unavailable'` otherwise).

### Typed entry

`9` → `09:00` · `930` → `09:30` · `9:30` / `9.30` / `9 30` → `09:30` ·
`3p` / `3pm` / `3 PM` → `15:00` · `15:00` → itself. Bare hours ≤ 7 with no
meridiem lean PM when the field is `hour12` (typing `3` into an
appointment field means 15:00, not 03:00) — bias overridden by `min`/`max`.
Like the date field, unparseable text stays, styled invalid, with a
`rejected` event.

### Keyboard map

| Key | Behaviour |
|---|---|
| printable | filters nothing away — opens the list scrolled to the nearest match |
| `Enter` | commits the highlighted option, else parses the typed text |
| `ArrowDown` / `ArrowUp` | moves through options (opens the list first if closed) |
| `ArrowUp` / `ArrowDown` on a **committed** value with the list closed | steps ±`minuteStep` |
| `Escape` | closes the list; if already closed, reverts to the committed value |
| `Tab` / blur | commits typed text, never traps |

### ARIA contract

- The input is `role="combobox"` with `aria-expanded`, `aria-controls`, and
  `aria-activedescendant` over a `role="listbox"` — byte-for-byte the
  search-input contract.
- Options are named in the display format (*"3:00 PM"*); the selected
  option is `aria-selected`.
- Commits and rejections announce through `role="status"`:
  *"3:00 PM."* / *"5:00 PM isn't available."*

---

## Part 4 — composition: `uni-date-time-input`

The foundation stays two components; composition is one thin wrapper —
**no third widget vocabulary.** It seats a `uni-date-input` and a
`uni-time-input` in one `uni-input-box` chrome under one label, and maps
two part-values to one combined value:

```ts
// Signal Forms block over the combined value
value = model<UniDateTime | undefined>();       // 'YYYY-MM-DDTHH:mm'
label = input.required<string>();               // "Appointment"

// Forwarded wholesale
min = input<UniDateTime>(); max = input<UniDateTime>();   // split into date/time fences
disabledDates …; markers …; slots …; minuteStep …; hour12 …;
slotsFor = input<(date: UniDate) => UniTime[]>();  // scheduling: slots depend on the day
```

Rules that make it feel like one field rather than two glued inputs:

- `value` emits only when **both** parts are set; clearing the date clears
  the combined value (a time without a day is not an answer).
- The time part is disabled until a date is chosen when `slotsFor` is set —
  the scheduling flow in one attribute.
- One label names the group; the parts get *"Date"* / *"Time"* as their
  own names, so a screen reader hears *"Appointment, Date"* then
  *"Appointment, Time"*.
- Tab order: date field → time field. Two tab stops, honestly — it *is*
  two questions.

Apps that need a different arrangement (calendar always inline, slot
buttons instead of a time field — the prototype's scheduling demo shows
this) compose the primitives directly; the wrapper is a convenience, not
the only door.

### Theme entries

```ts
dateInput: {
  options: {
    toggleSymbol: 'calendar_month',
    popupShadow: 'menu',
    popupBorderRadius: 'xs',
    popupColor: 'primary-surface',
  },
},
timeInput: {
  options: {
    toggleSymbol: 'schedule',
    listColor: 'primary-surface',   // same trio as tagInput/searchInput
    listShadow: 'menu',
    listBorderRadius: 'xs',
    maxVisibleOptions: 7,
  },
},
dateTimeInput: {
  options: { partGap: 'sm', dividerColor: 'outline' },
},
```

Field chrome is **not** duplicated here — it comes from `input`, via
`uni-input-box`, exactly like tag-input.

---

## What the prototype already proves

`index.html` is behaviour-complete for everything above; `test.mjs`
(Playwright, `node test.mjs`) drives it headlessly and asserts the
behaviours — worth porting straight into the Vitest specs:

- grid keyboard map: arrows, week `Home`/`End`, `PageUp`/`PageDown` (+Shift
  for years) crossing month edges, disabled-day skipping, min/max fences
- single selection, `aria-selected`, `aria-current="date"` on today, one
  tab stop with roving tabindex
- range mode: start → preview → end, backwards commit swaps ends, `Escape`
  cancels a pending range, live-region narration of each step
- markers render dots and extend day names for screen readers
- date input: ISO / locale-numeric / month-name parsing, next-occurrence
  year resolution, `aug 32` stays in the field flagged invalid, `Escape`
  reverts, ArrowUp/Down stepping, popup open (`ArrowDown`) → grid → `Enter`
  commits and returns focus
- time input: `9` `930` `3p` `15:00` parsing, PM bias, slot pinning
  (`unavailable` rejection), combobox ARIA wiring, step-on-arrow
- scheduling composition: picking a day loads that day's slots, changing
  the day clears a now-invalid slot, combined value only when both set
- light/dark parity on the real generated palettes

## Open questions

1. **A range *input field*.** The calendar selects ranges; there is no
   typed field for one yet. One field (`Aug 20 – 24`) parses ambiguously;
   two linked `uni-date-input`s (start's `max` = end, end's `min` = start)
   work today with no new component. Decide when a booking use case lands.
2. **Natural-language parsing** — `tomorrow`, `next tue`? Cheap to add,
   hard to localize honestly. Current line: month names yes (Intl gives
   them), relative words no.
3. **Mobile.** On coarse pointers the popup calendar is fine, but is typed
   entry worth it, or should small screens get `inputmode="numeric"` and a
   bigger grid? Not blocking — the components work on touch — but worth a
   usability pass.
4. **Dual-month range calendar** (`months=2`) — deferred, see Part 1.
5. **Week numbers** (`showWeekNumbers`) — trivial to add as a theme option,
   deliberately left out until someone asks.
6. **`uni-time-input` vs a future combobox primitive** — like tag-input,
   this is ~80% a combobox. If the roadmap's combobox lands, time-input
   should become a preset of it rather than a fork.

## Deviations in the shipped implementation (2026-08-20)

- **`min`/`max` are renamed** to `minDate`/`maxDate` (calendar, date input),
  `minTime`/`maxTime` (time input) and `minDateTime`/`maxDateTime`
  (composer): Signal Forms' `FormUiControl` reserves `min`/`max` as
  `Signal<number | undefined>` for numeric constraint binding, so
  string-valued fences cannot use those names on a `FormValueControl`.
- **Plain `ArrowDown` steps, not opens**, on a committed value (decided over
  the APG-style always-open reading): `Alt+ArrowDown` always opens,
  `ArrowDown` opens only from an empty field — the keyboard table above
  reflects this.
- `uni-date-input` and `uni-time-input` gained an `embedded` input that drops
  their own `uni-input-box` chrome, so `uni-date-time-input` renders one
  shared box instead of nesting field chrome.

## Checklist to ship (per `packages/angular/AGENTS.md`)

- [ ] `'calendar'`, `'dateInput'`, `'timeInput'`, `'dateTimeInput'` added to
      `ComponentName`; theme entries in uni-core's base theme
- [ ] `calendar/` component + model (+ date helpers in the cdk: ISO math,
      `Intl` parse/format — pure functions, unit-tested hard)
- [ ] `date-input/`, `time-input/`, `date-time-input/` components, models,
      barrels; export from `components/index.ts`
- [ ] Specs covering the keyboard maps **and** the ARIA contracts
- [ ] `.stories.ts` + `.mdx` each (Overview / Usage / variations / Theme
      options / Accessibility / Do / Don't)
- [ ] `ACCESSIBILITY.md`: all four keyboard maps
- [ ] `pnpm lint && pnpm test && pnpm build && pnpm docs:api`
