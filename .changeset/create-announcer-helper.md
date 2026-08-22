---
'@uni-design-system/uni-angular': minor
---

New `createAnnouncer()` in the CDK's a11y helpers: the polite live region a
form control uses for its running commentary — commits, clears, refused
entries, result counts — changes a sighted user sees but that are otherwise
silent to a screen reader.

`uni-combobox`, `uni-tag-input`, `uni-time-input`, `uni-date-input`,
`uni-calendar` and `uni-tour` now share it instead of carrying byte-identical
copies. The helper holds no DOM and no styling: the `role="status"` element
stays in each component's own template, where its placement and
visually-hidden class already belong.

This fixes a real bug in `uni-tour`, which had a plain signal rather than a
copy of the shared idiom. Assistive tech reads a live region when its content
*changes*, so writing the identical string is a no-op — its "Next available"
gate message was announced on the first step that used it and silently dropped
on every later one. `createAnnouncer` breaks the equality with a trailing
space, inaudible to a screen reader, alternating between the two forms so
nothing accumulates.

Consuming the helper directly:

```ts
protected readonly announcer = createAnnouncer();
// this.announcer.announce('Alabama selected.');
```

```html
<span role="status" aria-live="polite" [class]="srOnly">
  {{ announcer.message() }}
</span>
```

The region must already be in the DOM when the component renders — one added
at the moment it gains text is not reliably announced.
