---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

Listbox popups (`uni-search-input`, `uni-tag-input`, `uni-time-input`, `uni-combobox`): the active/hover option fill is now the themable `activeColor` option (default `'primary-container'`, on-color derived) instead of a hardcoded token pair. Set it when your theme maps `primary-container` and `primary-surface` to the same color — the keyboard highlight is otherwise invisible; a canvas/hover tint like the one your menus use is usually right (`searchInput: { options: { activeColor: 'tertiary-surface' } }`, and likewise `tagInput`/`timeInput`/`combobox`). The base theme carries the default explicitly so the option is discoverable in each component's Theme options table.

The four popups now share one style source, the exported `listboxPopupStyles(theme, options, { maxHeight? })` helper (`UniListboxPopupOptions`), so their surface trio and highlight can no longer drift apart. Rendering is unchanged under existing themes; the active row's text color now derives from `listColor`'s on-pair rather than assuming `on-primary-surface`.
