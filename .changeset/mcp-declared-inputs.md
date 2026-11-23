---
'@uni-design-system/uni-mcp': patch
---

Component API tables are complete, and synthesized examples bind only what a
component declares.

- 23 inputs and outputs were missing from the API tables: any member whose
  type or default holds an arrow function (`compareWith`, `filterWith`,
  `disabledDates`, `rowClass`, `parse`, `validate`, …), whose type is an
  object literal (`tour`'s `stepChanged`, `skipped`), or whose declaration
  wraps across lines. They are now listed.
- An input's default no longer includes its options bag
  (`false, { transform: booleanAttribute }` is now `false`, typed `boolean`).
- An aliased input reports the name a template binds: `maxLength` on
  `uni-tag-input` is listed with "bind as `max`".
- The element synthesized for an args-only story binds only args the
  component declares as an input or model, under the alias where there is
  one. Any other arg is listed beneath the tag instead of bound.
- An input declared with a transform type (`input<T, TransformT>`) reports
  `T` alone.
