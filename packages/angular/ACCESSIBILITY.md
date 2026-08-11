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

## Known gaps (tracked in TODO.md)

- No automated contrast verification of theme token pairs.
- Storybook axe checks are not yet enforced in CI.
- Menu typeahead matches on the first character only.
