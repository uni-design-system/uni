---
'@uni-design-system/uni-angular': major
---

Text is attribute-only, with a value shorthand and element-aware defaults

**Breaking:** the `uni-text` and `Text` element selectors are removed. Text is now the
attribute `[uni-text]` on any element, keeping your HTML semantics:

- **Value shorthand** — the attribute value is the typeface:
  `<h1 uni-text="display-small">`, `<span uni-text="caption">`, dynamic via
  `[uni-text]="role()"`. The explicit `typeface` input still works (the attribute
  value wins when both are set).
- **Element-aware defaults** — with no value, the typeface is inferred from the host:
  `h1`→headline-large, `h2`→headline-medium, `h3`→headline-small, `h4`→title-large,
  `p`→body-1-long, `small`/`figcaption`→caption, `blockquote`→quote, `label`→label,
  else title-small. Plain semantic markup is correctly set with zero configuration.

Migrate `<uni-text typeface="body-1-long">…</uni-text>` →
`<p uni-text>…</p>` (or `<span uni-text="body-1-long">` where no semantic element
fits). All internal usages, stories, and docs are migrated.
