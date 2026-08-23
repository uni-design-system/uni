---
'@uni-design-system/uni-angular': minor
---

The layout primitives and `uni-text` are now **directives**, so they compose.

They were components with attribute-only selectors, which meant any two of them
on one element threw NG0300 ("multiple components match"). `<div row-layout
uni-text="title-small">` — the most natural thing to write — threw in dev only,
so it reached production as a silent style mismatch. `<uni-card box-layout>`
was blocked for the same reason, and `box.component.ts` documented the
wrap-it-in-a-div workaround as permanent.

All eight are pure host-styling wrappers (an `<ng-content>`-only template plus a
`[class]` host binding), so as directives they render identically and now stack
freely — with each other, with `uni-text`, and with a component's own host
element. Angular reconciles the host `class` bindings additively, so each
contributor's styles survive rather than one silently winning; there is a spec
pinning that.

```html
<div row-layout uni-text="title-small" padding="md">Heading</div>
<uni-card box-layout padding="lg">…</uni-card>
```

**Renames, with deprecated aliases.** `UniBoxComponent` → `UniBoxDirective`, and
likewise for Row, Stack, Center, Wrap, Grid, GridArea and Text. The old names
are still exported as deprecated aliases, so existing `imports: [UniBoxComponent]`
keeps compiling — but they will go in a future major.

**New: `uni-text`'s `textColor`.** `color` is an input on the layout directives
too, where it means a *container* pair (background plus its on-color). On a
shared element one `color` binding feeds both directives, so the ink and the
background resolve to the same token and the text disappears — a trap the
combination could not previously reach. `textColor` sets the ink unambiguously
and wins over `color`.

**New: `UNI_LAYOUT` and `UNI_FORMS`.** These are attribute selectors, so an
element carrying one whose directive was never imported compiles cleanly and
silently does nothing. Spreading a family is the cheapest guard:

```ts
imports: [...UNI_LAYOUT]
```
