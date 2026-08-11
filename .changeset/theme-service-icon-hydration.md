---
'@uni-design-system/uni-angular': minor
---

Themes registered from JSON get the built-in icons back

`registerTheme` and `setTheme` now hydrate a theme's icons on the way in: the
built-in set is merged *under* whatever icons the payload carries, so the
theme's own icons still win.

This is what makes a theme fetched as JSON usable. Transports elide `BaseIcons`
— roughly 71% of a serialized theme, and bytes the consumer already ships — so
without hydration a fetched theme would validate cleanly and then render no
icons at all. The rule is the same one `createTheme` already applies at
construction (`{...BaseIcons, ...icons}`), so a theme behaves identically
whether it was built in-process or arrived over the wire.

Themes provided through `UNI_THEMES` are unaffected: they already carry the full
set, so hydration is a no-op.
