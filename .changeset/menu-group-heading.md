---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

`uni-menu`: group headings.

- A fourth `MenuItem` shape, `{ heading: string }` (`MenuHeading`, with the
  `isHeading` guard), names the items that follow it up to the next heading or
  divider. Those items render inside a `role="group"` labeled by the heading.
  The array stays flat, and items with no heading above them render exactly as
  before.
- A heading is text, not a command: no focus, no hover fill, no click, and it
  is skipped by arrow keys, Home, End and typeahead. A heading with no items
  under it renders nothing.
- New `menu` theme options `headingTypeface`, `headingColor`, `headingHeight`
  and `headingPaddingHorizontal`. The base theme sets `caption` in
  `on-surface-variant` at 28px; the padding follows
  `menuItem.paddingHorizontal` when unset so heading and item text align.
