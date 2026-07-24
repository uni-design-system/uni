---
'@uni-design-system/uni-core': minor
---

TextStyle now accepts CSS length strings, not just px numbers

- `fontSize`, `lineHeight`, `letterSpacing`, `textIndent`, and `wordSpacing` on
  `TextStyle` are widened from `number` to the new exported `CssLength`
  (`number | string`). Bare numbers still mean px, matching Emotion's own
  convention; strings pass through verbatim, so any unit the CSS engine accepts
  works — `'1.2rem'`, `'2em'`, `'clamp(1rem, 2vw, 1.5rem)'`, unitless
  line-height multipliers like `'1.5'`, etc.
- `toTypeface` no longer blindly appends `px`: numbers are converted, strings
  are passed through untouched. Existing numeric themes are unaffected.
