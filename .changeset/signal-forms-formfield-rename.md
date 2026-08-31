---
'@uni-design-system/uni-angular': patch
---

Signal Forms docs said `[field]`; the directive is `[formField]`.

`[field]` was the selector in the Angular 21.0 Signal Forms preview and was
renamed before release. In 21.2 the directive is `FormField`, selector
`[formField]`, with its required input aliased to `formField` — `[field]` does
not exist at all. Every form control in this library was documented with the
name that had been removed, across seven component doc comments and five MDX
files, and all of it flowed into the MCP index and the generated API reference.
A consuming app found this, not us.

Nothing about the components changed: they already satisfy `FormValueControl` /
`FormCheckboxControl` and always bound correctly.

**The reason it rotted is that nothing compiled a binding.** No spec or story in
the library imported `@angular/forms/signals` — the toggle's "Form Signals" story
hand-bound `[checked]` and `[touched]` as plain props, which demonstrates
nothing about Signal Forms and would keep passing through any rename. There is
now a spec that binds a real `form()` to `uni-toggle` through `[formField]` and
asserts the round trip in both directions, plus `touched` and `required`
propagation, so the next rename fails CI instead of the docs. The story binds a
real form too.
