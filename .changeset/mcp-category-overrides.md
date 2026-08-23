---
'@uni-design-system/uni-mcp': patch
---

Fix three miscategorized components in the index.

Categories come from an ordered list of substring regexes, so a name that merely
contains an earlier row's keyword lands in the wrong bucket — and a
miscategorized component is invisible to `list-components --category`, which is
how agents and humans find things.

- `textarea` → **forms** (was `primitives`: `/text/` matches inside "textarea"
  and wins before the forms row is tried)
- `combobox` → **forms** (was `layout`: `/box/` matches inside "combobox")
- `expand-toggle` → **layout** (was `forms`: `/toggle/` beat `/expand/`)

Known ids now go through an explicit override map consulted before the keyword
pass, so a fix is a one-line entry rather than a regex that has to be reasoned
about globally.

Also: MDX pages are matched to their source by basename, stripping only
`.component.ts`. With the layout primitives and `uni-text` becoming directives,
`.directive.ts` is stripped too, so their docs keep attaching by name instead of
falling through to the same-directory fallback.
