---
'@uni-design-system/uni-angular': major
---

`ThemeService`: validated writes, runtime theme registration, live options

The theme registry was bootstrap-frozen and nothing validated theme writes —
and a brand theme applied via `applyPalette` never appeared in
`uni-theme-switch`, leaving the select on a bogus value with no way back.

**Breaking**

- `ThemeService.theme` is now a **readonly signal**. Direct `theme.set(...)`
  calls (already discouraged in the docs) must move to `setTheme(input)`,
  which validates and returns `ThemeParseResult` — acceptance or the complete
  list of rejection reasons — leaving the active theme untouched on rejection.
- `selectTheme(name)` now returns `boolean` and, for an unknown name, **does
  nothing** — previously it silently kept the old theme while still recording
  the bad key in `selectedThemeKey` and localStorage.
- `themeOptions` is now a `computed` (was a once-written writable signal).

**New**

- **`registerTheme(input, { select? })`** validates and adds a theme to the
  live registry — it appears in `themeOptions`/`uni-theme-switch` immediately.
  **`unregisterTheme(id)`** removes it, falling back to the first remaining
  theme when it was active. Themes injected via `UNI_THEMES` are validated at
  startup; malformed entries are excluded with a console warning listing every
  reason.
- **`applyPalette` registers the generated theme under `CustomTheme`**, so
  "Your Brand" is an ordinary, selectable option: it shows in the switcher,
  survives switching away and back, and `clearCustomPalette` unregisters it.
- **`uni-select` fix:** a selection pointing at an option added in the same
  change-detection pass now applies (per-option `[selected]` binding; the
  select-level `[value]` write landed before new options existed and was
  ignored by the browser) — any consumer with a growing options list was
  affected.
