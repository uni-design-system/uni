# Accessibility

UNI Angular targets **WCAG 2.2 AA**. This document describes the accessibility
contract each component provides, the keyboard interactions it implements, and
what consumers must supply themselves.

## Global behaviors

- **Reduced motion** — all animations and transitions collapse to a single
  frame when the user sets `prefers-reduced-motion: reduce` (injected globally
  by `ThemeService`).
- **Decorative icons** — `Symbol` and `Icon` render with `aria-hidden="true"`.
  A meaningful icon must get its name from the parent control (e.g. an icon
  button's text or `ariaLabel`).
- **Focus rings** — interactive components show a visible `:focus-visible`
  outline. `ThemeService.focusRing(token?)` is available for custom components.
- **Visually hidden text** — the `visuallyHidden` style object (exported from
  the cdk) hides content visually while keeping it available to screen readers.

## Component contracts

### Button (`button[uni-text-button]`)
- Native `<button>` semantics; `Enter`/`Space` work natively.
- `loading` sets `aria-busy="true"` and disables the button; the spinner is
  decorative.

### IconButton (`button[icon-button]`)
- **The accessible name comes from projected text** (rendered visually
  hidden): `<button icon-button symbolName="close">Close</button>`, or from
  the `ariaLabel` input. Always provide one of the two.
- `loading` sets `aria-busy="true"`.

### Menu / MenuItem
- Trigger carries `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`.
- `ArrowDown`/`ArrowUp` on the trigger opens the menu and focuses the
  first/last item.
- Inside the menu: `ArrowDown`/`ArrowUp` move focus (wrapping), `Home`/`End`
  jump, `Enter`/`Space` activate, printable characters jump to the next item
  starting with that letter, `Escape` closes (native popover light-dismiss),
  `Tab` closes and returns focus to the trigger.
- Items are `role="menuitem"`; the active item is marked `aria-current`.
- Focus returns to the trigger when the menu closes.

### Dropdown
- Generic popover container: manages `aria-expanded`/`aria-controls` on its
  trigger and restores focus to the trigger on close. Set `ariaHasPopup` to
  describe the content (`menu`, `dialog`, `listbox`, ...).
- `Escape` and outside-click dismiss via the native popover API.

### MultiSelectDropdown
- Disclosure pattern (`aria-haspopup="dialog"`): the popover contains native
  focusables (search input, checkboxes, Done button) reachable with `Tab`.
- Focus moves to the search field on open and back to the trigger on close.
- **The trigger names the field**, not just its current value: set `label` and
  the accessible name reads "Fruits, 2 selected, Apple, Cherry". Without it a
  screen reader announces only the selection, with no clue which field it is.
- Arrow keys, Home and End walk the options from anywhere in the panel (shared
  `ListboxNavigation`), so reaching the last of thirty options no longer means
  thirty `Tab` presses. Other keys pass through to the filter box.
- The options are a `role="group"` labelled from `label`. Deliberately **not**
  a multi-selectable `listbox`: APG notes that pattern is inconsistently
  handled by screen readers and suggests checkboxes instead, and real
  checkboxes keep each option's state announced natively.
- An empty filter result is announced through `role="status"` rather than
  leaving the panel silently blank.

### Dialog / DialogHeader
- Native `<dialog>` + `showModal()`: focus trap, `aria-modal`, and focus
  restore to the opener are native behavior.
- `Escape` runs the same animated close as the close button (the native
  `cancel` event is intercepted).
- A `DialogHeader` automatically labels the dialog (`aria-labelledby`);
  without one, set the `ariaLabel` input.
- `initialFocus` (CSS selector) directs focus on open when the browser
  default (first focusable) isn't right.

### Tooltip
- Shows on keyboard focus (immediately) and on hover (after `hoverDelay`);
  hides on blur, pointer-out, or `Escape` (WCAG 1.4.13).
- The bubble is a declarative `role="tooltip"` popover in the native top
  layer, linked via `aria-describedby` to the focusable trigger. If the
  projected content isn't focusable, the host becomes keyboard-reachable
  (`tabindex="0"`).
- Never put essential controls inside a tooltip label.

### Form controls (Signal Forms)
All controls implement `FormValueControl`/`FormCheckboxControl` and set
`aria-invalid` once the field is invalid **and** touched or dirty.
- **Input** — `label` is exposed as the accessible name (`aria-label`).
- **Checkbox** — native input + visible SVG; supports `indeterminate`
  (cleared on user interaction, like the native property).
- **Toggle** — announced as a switch (`role="switch"`).
- **Radio** — `role="radiogroup"` labelled by its `label`; group `name` is
  unique per instance by default. Arrow keys move within the group natively.
- **SelectInput** — native `<select>`; provide `ariaLabel` (a placeholder is
  not a label).
- All controls expose `required` (synced from `required()` validators by the
  `[field]` directive) as `aria-required`.
- Error *messages* are not rendered by the controls — render your own and pass
  its element id via the `ariaDescribedBy` input, which is exposed as
  `aria-describedby` on the native control.

### DataTable / SortHeader / Paginator
- Column headers use `scope="col"` and expose sort state via `aria-sort`;
  sorting is a real button (`Enter`/`Space`).
- With `useRowClick`, rows are focusable and activate with `Enter`/`Space`.
- Collapsed detail rows are `inert` (hidden from screen readers and the tab
  order) until expanded.
- The loading overlay is `role="status"` and the table region sets
  `aria-busy` while loading.
- Paginator is a `role="navigation"` landmark ("Pagination"); page buttons
  are real buttons with `aria-current="page"` on the active page; the page
  size and jump inputs are labelled.

### Expand / ExpandToggle / ExpandArea
- The toggle button exposes `aria-expanded` and (when wired via
  `ariaControls`, automatic inside `ExpandArea`) `aria-controls`.

### FileDropZone
- With `useBrowseButton`, the button opens the native file picker.
- Without it, the zone itself is keyboard-reachable (`role="button"`,
  `tabindex="0"`, `Enter`/`Space` open the picker).

### Alert / Snackbar
- Alert announces assertively (`role="alert"`); Snackbar politely
  (`role="status"`) without stealing focus.
- Snackbar auto-dismiss pauses while hovered or focused (WCAG 2.2.1).

### NotificationBadge
- The visual count/dot is decorative; a visually hidden text alternative is
  announced ("5 notifications" by default — set `ariaLabel` for something
  more specific, e.g. "5 unread messages").

### ProgressBar / ProgressGauge
- `role="progressbar"` with `aria-valuenow/min/max`; name defaults to
  "Progress" — set `ariaLabel` to describe *what* is progressing.

### Tag
- A static tag is **text, not a widget**: no role and no tab stop, so screen
  readers read the label as content.
- `removable` adds one real `<button>` announced as "Remove {label}", or
  `removeLabel` when that name needs to differ.
- `interactive` makes the chip **body** a `<button type="button">` and maps
  `selected` to `aria-pressed`. The remove button stays a *sibling* of the body,
  never nested inside it — nesting would be invalid HTML and would leave the
  inner control unreachable by keyboard.
- Lead content (avatar, initials, symbol, status dot) is `aria-hidden`, so the
  chip's text remains its accessible name.
- `invalid` sets `aria-invalid` and adds a dashed underline, so the state is not
  carried by colour alone (WCAG 1.4.1).

### TagInput
- The text input is `role="combobox"` with `aria-expanded`, `aria-controls` and
  `aria-activedescendant` over a `role="listbox"` popup — the same contract as
  SearchInput, shared through the CDK's `ListboxNavigation`.
- **One tab stop for the whole field.** Chips and their remove buttons carry
  `tabindex="-1"`; the keyboard route in is Backspace or ArrowLeft, so Tab never
  walks through every recipient to reach the next control.
- Adds, removes and rejections announce through a `role="status"` live region —
  keyboard removal and the rejection pulse are otherwise silent.
- The removal route is described once per field via `aria-describedby`, not
  repeated on every chip.
- `aria-invalid` is gated on `invalid && (touched || dirty)`; per-chip
  invalidity shows immediately, since it describes a token just typed.

### NumberInput
- The control is `<input type="text">` with `role="spinbutton"`,
  `aria-valuenow`, `aria-valuemin` and `aria-valuemax`. `type="text"` is
  deliberate: per the HTML value sanitization algorithm a `type="number"` input
  holding text that is not a valid floating-point number reports `value === ''`,
  so `12,50` or a pasted `1,234.56` becomes an empty field with nothing shown to
  the user. Keeping the text is the whole point.
- **`aria-valuetext` carries the formatted string with its affixes** — "$1,234.56",
  "15 percent", "72 kilograms". `aria-valuenow` alone announces "1234.56", which
  is the one thing about a money field that is not the point. The `prefix` /
  `suffix` adornments are `aria-hidden` so they are not read twice;
  `unitAnnouncement` supplies the spoken long form of an abbreviation.
- An **empty** field omits `aria-valuenow` entirely (per APG) and sets
  `aria-valuetext` to "Empty" — a spinbutton reporting 0 for "nothing yet" is a
  wrong answer, not a missing one.
- Keyboard map, shared with Slider so nothing is learned twice: `ArrowUp` /
  `ArrowDown` ±`step`, committed immediately; `Shift+Arrow` and `PageUp` /
  `PageDown` ±`largeStep`; `Alt+Arrow` ±`smallStep` when set; `Home` / `End` to
  `min` / `max`, **no-op when that bound is undefined** — nothing sensible lives
  at an unbounded fence. `Enter` parses and commits and never submits the form
  while an uncommitted draft is in the field; `Escape` reverts the draft and
  cancels an in-flight hold; `Tab` commits, then moves on, never trapping.
- **One tab stop for the whole field.** The stepper buttons are real `<button>`s
  named "Increase {label}" / "Decrease {label}" with `tabindex="-1"`: they are
  pointer affordances, and the keyboard route is the arrow keys. The same
  reasoning governs Combobox's chevron and TagInput's per-chip remove.
- **Target size, honestly.** The `split` and `trailing` layouts give each button
  a full-height square, clearing the 24×24 minimum of WCAG 2.2 SC 2.5.8. The
  `stacked` layout cannot: two arrows sharing a 32px field are 16px each, and
  2 × 24 does not fit. It stays the default because a mouse is precise, and on
  a **coarse pointer the component switches itself to `split`**, which is where
  target size actually decides whether a tap lands. A theme needing the larger
  targets on every pointer sets `stepperLayout: 'split'`.
- One `role="status"` region announces clamps ("Maximum is 100. Value set to
  100."), fences, rejections and expression results — each otherwise a purely
  visual event. Hold-to-repeat announces **on release only**; a screen reader
  narrating two hundred intermediate values is a denial of service.
- An unparseable draft **stays in the field**, flagged with `aria-invalid` and a
  dashed underline as well as the error border, since colour alone cannot carry
  "this is not a number" (WCAG 1.4.1). A field that swallows `12..5` and shows
  an empty box has lost the user's work and told them nothing.
- `inputmode` follows the preset and is `numeric` only when negatives and
  decimals are both impossible, since several mobile keypads omit `−` and `.`
  from the numeric layout entirely.
- Clamping happens **on commit, never per keystroke**: a `min=10` field that
  clamps live can never be typed into, because the `1` becomes `10` before the
  `5` arrives.
- `readOnly` keeps the text selectable, hides the steppers and sets
  `aria-readonly`. `aria-invalid` is gated on `invalid && (touched || dirty)`.

### QuantityStepper
- The middle is an `<input role="spinbutton">` named by `label`, with
  `aria-valuenow` / `aria-valuemin` / `aria-valuemax`. An empty stepper omits
  `aria-valuenow` and reads "Empty".
- **`label` is never visible and always required.** A cart with six of these
  needs "Quantity, Blue T-shirt (M)" on each, not six controls all announced as
  "Quantity".
- Tab stops shift with `editable`. While editable the input is the single stop
  and the buttons carry `tabindex="-1"` as pointer affordances, the keyboard
  route being the arrow keys — the same split as NumberInput. With
  `editable=false` there is no input to focus, so the buttons become the tab
  stops and the wrapper takes `role="group"` with the accessible name; the
  value itself is plain text, with no role and no tab stop.
- The buttons are square at the component's outer height (`sm` 24 / `md` 32 /
  `lg` 40). `md` — the default — and `lg` clear the 24×24 pointer target of
  WCAG 2.2 SC 2.5.8. **`sm` does not**: a 24px bordered box leaves 22px inside,
  two short. It is the dense desktop option; keep touch surfaces on `md` or
  larger. Same trade-off as NumberInput's stacked arrows, and the same advice.
- Keyboard map is NumberInput's, minus what this control does not have: arrows
  step, `Enter` commits, `Escape` reverts the draft, blur commits.
- A `role="status"` region announces fences, clamps and removals;
  hold-to-repeat announces once, on release.
- At a fence the matching button is `disabled` rather than a silent no-op. With
  `deleteAtMin` the decrement stays **enabled** at `min`, because there it is
  the one control that still does something — it is renamed "Remove {label}"
  and emits `removed` instead of stepping.
- Unreadable typed text reverts rather than being kept and flagged: this control
  has no room to show an error and no `rejected` output to report one. Use
  NumberInput where the input needs to be validated in place.

### Slider
- Each thumb is a `role="slider"` with `tabindex="0"`, `aria-valuenow`,
  `aria-valuemin`, `aria-valuemax` and **`aria-valuetext` in the display
  format** — a money slider says "$500", not "500", and a marks-only slider says
  "Medium", not "3".
- Keyboard map, shared with the numeric input family so nothing is learned
  twice: `ArrowUp`/`ArrowDown` ±`step`; `ArrowRight`/`ArrowLeft` ±`step`;
  `Shift+Arrow` and `PageUp`/`PageDown` ±`largeStep` (default a tenth of the
  range); `Home`/`End` to `min`/`max`. One commit and one announcement per key
  run, on key-up.
- **Up and Down follow the number; Left and Right follow the picture.** The
  horizontal arrows mirror in right-to-left layouts, the vertical ones never do
  (APG's rule). The track's visual direction flips in RTL; the value's does not.
- Range mode wraps both thumbs in a `role="group"` named by `label`; the thumbs
  are named "{label}, minimum" and "{label}, maximum", and each thumb's
  `aria-valuemin`/`aria-valuemax` report **the other thumb's position**, so a
  screen-reader user is told where the wall actually is. Two tab stops — it is
  two questions.
- Thumbs may cross and swap roles; the dragged thumb keeps its identity and its
  focus through the swap, so the control never jumps out from under the pointer.
- The thumb's pointer target is padded to at least 24×24 (WCAG 2.2 SC 2.5.8)
  even when the visual dot is 16px; `touch-action: none` is set on the track
  only, so a vertical page scroll that starts there still scrolls.
- Marks with labels render in a `role="presentation"` row and are not separately
  focusable — their text is folded into `aria-valuetext` at the matching value.
- The `role="status"` region carries fences and swaps only. Ordinary movement is
  already narrated by `aria-valuetext`, and doubling it is noise.
- `aria-invalid` is gated on `invalid && (touched || dirty)`, per the shared
  form-control rule.
- `valueDisplay="input"` seats a NumberInput as the readout, two-way bound to
  the same value. That is a **second tab stop** with its own label ("{label}
  value"), because it is a separate control — drag for the ballpark, type for
  the exact figure. Single mode only.

### Calendar
- The month grid is `role="grid"` with `aria-labelledby` pointing at the month
  heading (or `aria-label` when standalone); weekday cells are
  `role="columnheader"` with an `abbr` carrying the full weekday name.
- Every day is a real `<button>` inside a `role="gridcell"`, named with its
  full date (*"Thursday 20 August 2026"*) plus any marker labels (*"… 3 slots
  open"*) — numbers alone are never the name.
- **One tab stop** with roving `tabindex`: `←`/`→` ±1 day, `↑`/`↓` ±1 week,
  `Home`/`End` first/last day of the focused week, `PageUp`/`PageDown` ±1
  month (`Shift` for ±1 year), `Enter`/`Space` selects, `Escape` cancels a
  pending range. Arrows skip disabled days in their direction of travel; the
  `minDate`/`maxDate` fence stops the caret and never wraps; month edges never
  block — the grid follows the focused day.
- Today is `aria-current="date"` with an outline; selection is a solid fill;
  markers are dots — no state is carried by colour alone (WCAG 1.4.1).
- The heading is `aria-live="polite"` so month moves narrate without
  refocusing; selections and range progress (*"Start date …. Choose an end
  date."*) announce through one `role="status"` region per calendar.
- Prev/next month are real icon-buttons named "Previous month"/"Next month",
  outside the grid. `aria-invalid` gated on `invalid && (touched || dirty)`.

### DateInput
- The text input is a **plain input, not a combobox** — there is no
  filtering-a-list relationship. Free text parses on `Enter`/blur; `Tab`
  commits and moves on, never trapping.
- The popup toggle is an icon-button named from the value (*"Choose date"* /
  *"Change date, 20 August 2026"*) with `aria-haspopup="dialog"` and
  `aria-expanded` (wired by the shared dropdown).
- `Alt+ArrowDown` (or `ArrowDown` in an empty field) opens the popup with
  focus on the selected day; `↑`/`↓` on a committed value step ±1 day.
- The popup is a native popover with `role="dialog"` labelled "Choose date";
  `Tab` cycles inside it while open (APG date-picker pattern); `Escape` and
  day selection close it and return focus to the field.
- Commits, steps and rejections announce through `role="status"`; a refused
  draft sets `aria-invalid` and a dashed underline (shape + colour) until
  edited; form-level `aria-invalid` gated on `invalid && (touched || dirty)`.

### TimeInput
- `role="combobox"` with `aria-expanded`, `aria-controls` and
  `aria-activedescendant` over a `role="listbox"` — byte-for-byte the
  SearchInput contract, shared through the CDK's `ListboxNavigation`.
- Options are named in the display format (*"3:00 PM"*); the committed option
  is `aria-selected`. Typing never selects — `Enter` commits the draft.
- `↑`/`↓` navigate the list; on a committed value with the list closed they
  step ±`minuteStep` (±1 slot when `slots` pins the choices). `Escape` closes
  the list, then reverts; `Tab`/blur commit without trapping.
- Commits and rejections (*"5:00 PM isn't available."*) announce through
  `role="status"`; `aria-invalid` gated as above.

### DateTimeInput
- One `role="group"` named by `label`; the parts are named "Date" and "Time",
  so a screen reader hears *"Appointment, group"* then each part.
- Two honest tab stops (date, then time); each part keeps its own contract
  (popup dialog, combobox) inside one shared input-box chrome.
- The combined value emits only when both parts are set; with `slotsFor` the
  time part is disabled until a day is chosen.

### Combobox
- `role="combobox"` with `aria-expanded`, `aria-controls` and
  `aria-activedescendant` over a `role="listbox"` — the shared
  `ListboxNavigation` contract, fourth consumer after SearchInput, TagInput
  and TimeInput.
- `aria-selected` marks the **committed** option; the active one is carried by
  `aria-activedescendant` — different facts, and this control has both. The
  check icon is `aria-hidden`; `description` is part of the option's text,
  so it reads as part of its name (*"Alaska, Juneau"*).
- Disabled options render, announce (`aria-disabled`), and are skipped by the
  arrows (`↑`/`↓` wrap over them; `Home`/`End` land on the nearest enabled).
- Typing never selects — the draft resolves on `Enter`/`Tab`/blur to the
  active option or a unique exact match; `Enter` alone also accepts a filter
  narrowed to one option. A non-matching draft reverts and reports through
  `rejected`. `Escape` closes the list, then reverts the draft — it **never
  clears the committed value** (contrast SearchInput, where the value *is* the
  query). `Tab`/blur never trap.
- The clear ✕ is a real named button (*"Clear State"*), the only other tab
  stop; the chevron is `tabindex="-1"` `aria-hidden` — keyboard already has
  `ArrowDown`, and the input itself announces expanded state.
- Commits (*"Alabama selected."*), clears, refusals and debounced result
  counts (*"4 results."* / *"No matches."*) announce through `role="status"`;
  `aria-invalid` gated as above.

### Popover

- Rich mode is an APG disclosure: the focusable trigger carries
  `aria-expanded` + `aria-controls`, focus stays on the trigger on open
  (unless the panel marks `[autofocus]`), and returns to it on close. With no
  projected trigger the app drives `open` and no element claims controller
  ARIA. Light dismissal (outside click, Escape) is the native
  `popover="auto"` behavior.
- Tooltip mode flips the contract: `role="tooltip"` + `aria-describedby` on
  the trigger, never `aria-expanded` — a description, not a name. Hover opens
  after a delay, focus opens instantly, the panel itself is hoverable, and
  Escape dismisses without moving focus (WCAG 1.4.13 dismissable / hoverable
  / persistent). Focusable content in tooltip mode triggers a dev warning.
- No focus trap in either mode: the panel sits right after the trigger in the
  DOM, so Tab walks in and out naturally.

| Key | Rich | Tooltip |
| --- | --- | --- |
| `Enter`/`Space` on trigger | toggle | — |
| `Escape` | close (native) | close, focus unmoved |
| `Tab` | natural order, no trap | — |

### Callout

- Non-modal `role="dialog"` named by `header`/`ariaLabel`; `aria-modal` is
  deliberately absent — the page is dimmed, not removed from the tree.
- Initial focus: `[autofocus]` → first action → first focusable → the panel
  (`tabindex="-1"`), with `preventScroll`.
- The duet loop: Tab cycles the panel's focusables **plus the spotlit
  target** while it is interactive, wrapping in both directions. On close,
  focus restores to the pre-open element unless the user moved into the
  target — then it stays.
- Escape dismisses (when `dismissible`) with `reason: 'escape'`; backdrop
  clicks pulse the panel rather than closing unless `dismissOnBackdrop`.
- The spotlight ring is a shape, not color alone; the scrim never carries
  meaning.

### Tour

- Each step's panel is labelled "{title}, step {n} of {total}"; progress dots
  are `aria-hidden` decoration and the fraction variant repeats the label's
  numbers.
- One persistent polite `role="status"` region announces gate unlocks
  ("Next available"); gated steps never auto-advance mid-typing (only click
  gates auto-advance).
- `ArrowRight`/`ArrowLeft` navigate only while focus is inside the panel, so
  typing in a spotlit target is never hijacked; Tab is the callout's duet
  loop.
- Escape and the close button (named by `skipLabel`) skip the tour and report
  the step; missing-target steps are skipped, not broken.

## Known gaps (tracked in TODO.md)

- No automated contrast verification of theme token pairs.
- Storybook axe checks are not yet enforced in CI.
- Menu typeahead matches on the first character only.
