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
- The remove affordance is announced as "Remove {label}".

## Known gaps (tracked in TODO.md)

- No automated contrast verification of theme token pairs.
- Storybook axe checks are not yet enforced in CI.
- Menu typeahead matches on the first character only.
