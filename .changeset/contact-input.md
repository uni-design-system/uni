---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

Add `uni-contact-input`, a recipient field for picking people, and close the gaps that kept `uni-tag-input` from being an email client's To row.

- **`uni-contact-input`** (new): chips plus a contact list that opens on focus, filters by name or address, groups under headings, and draws each row as a person (avatar, name, address, note). ArrowDown and Enter pick a match (`autoHighlight` makes Enter or Tab pick the first one without arrowing), Backspace removes the last person, and a typo stays in the field while `(rejected)` reports it. `allowCustom` controls whether typed addresses are accepted; `unframed` drops the field chrome. Themed through the new `contactInput` entry.
- **`uni-tag-input`**: `uniTagSuggestion` row template; `group` headings and `avatarName` on suggestions; `openOnFocus`, `autoHighlight`, `backspaceRemoves`, `keepInvalidText`, `unframed` and `autocomplete` inputs; an undebounced `draftChange` output; a public `focus()`; `chipVariant` and `chipTone` theme options, so a theme sets the chip look once (`tagVariant` / `tagTone` still override per field). The default suggestion row now paints `description` (previously screen-reader only) and an avatar when one is given. The field opts out of password managers, and the first Escape that closes the list no longer reaches an enclosing dialog.
- **Listbox popups** (`tagInput`, `combobox`, `searchInput`, `timeInput`): `typeface` and `listWidth` theme options. Defaults are unchanged (`label`, field width).
- **`uni-combobox`, `uni-search-input`**: `openOnFocus` input.
- **`uni-tag`**: an avatar image that fails to load now falls back to the `avatarName` initials.
