---
'@uni-design-system/uni-core': minor
---

A wire format for themes: `hydrateTheme` / `dehydrateTheme`

A `UniTheme` is plain serializable data, which makes JSON the natural transport
for distributing themes — but a serialized theme is ~50 KB and **~71% of that is
the 61 built-in icon data URIs that every uni-core consumer already ships**.

- **`dehydrateTheme(theme)`** returns the wire form: icons identical to
  `BaseIcons` are dropped, genuine overrides kept. A theme goes from ~50 KB to
  ~14 KB, and still passes `parseTheme`.
- **`hydrateTheme(theme)`** restores the built-in set on the way in, applying
  the same `{...BaseIcons, ...icons}` contract `createTheme` applies at
  construction — the theme's own icons win, built-ins fill the rest.
- **`generateUniThemes` now returns the `ContrastReport`** alongside the
  light/dark pair, so a caller can generate registration-ready themes and their
  WCAG audit in one call instead of falling back to `emitThemeFile` (which
  returns TypeScript source) just to see the report.
- **`summarizeContrast(report)`** is extracted and exported, so the generated
  theme file's header and every other consumer word the audit identically.
