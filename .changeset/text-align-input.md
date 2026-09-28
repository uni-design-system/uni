---
'@uni-design-system/uni-angular': minor
---

`uni-text` gains a `textAlign` input; `align` is deprecated and will be removed in the next major.

`align` shares its name with HTML's obsolete `align` attribute, so `<p uni-text align="center">` drew an "Obsolete attribute" warning in IDEs, and a static value was also left on the rendered element as a real attribute. `textAlign` matches the CSS property it sets and the `textAlign` option dialog and drawer headers already use. `align` keeps working until then; when both are set, `textAlign` wins.

Migrate with a find-and-replace: `align="…"` → `textAlign="…"` and `[align]` → `[textAlign]` on `uni-text` elements.
