---
'@uni-design-system/uni-angular': major
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

**BREAKING: the layout directives' `color` is now `containerColor`.**

Composing the two directives exposed a name collision. `color` was an input on
both — a *container pair* on the layout primitives, the CSS `color` property on
`uni-text` — so on a shared element one binding fed both: the box painted the
surface, the text took the same token, and the text rendered as ink on identical
ink. A deprecated alias would have kept that path alive, so there isn't one.

`color` belongs to `uni-text`, which maps it straight to the CSS property. The
container pair is an invented concept and now says so:

```html
<!-- before -->        <div box-layout color="surface">
<!-- after -->         <div box-layout containerColor="surface">
```

This applies to all seven layout directives (Box and its subclasses) and to
`uni-scroll-area`, which is attribute-selected too and carried the identical
hazard. `backgroundColor`, which sets only the background and no paired
on-color, is unchanged, as is `color` on `uni-icon` / `uni-skeleton` /
`uni-badge` — there it already means a foreground color, the same sense as
`uni-text`'s.

Codemod: rename `color` → `containerColor` on any element carrying a `*-layout`
or `scroll-area` attribute; leave `color` alone everywhere else.

The rename fixed the input collision; a second one sat underneath it in CSS.
`containerColor` emits a background **and** its paired on-color, so both
directives write `color` to the element — at equal specificity, which left the
cascade to Emotion's insertion order (text won on `row-layout`, lost on
`scroll-area`). An explicit `uni-text` `color` is now emitted at doubled
specificity, so it deterministically wins; with no explicit color, the
container's on-color still shows through as intended.

`uni-dropdown` still names its container pair `color`. It is an element selector
(`<uni-dropdown>`), so the collision needs someone to put `uni-text` on a
component host — possible, but not the natural path the layout attributes are.

**New: `UNI_LAYOUT` and `UNI_FORMS`.** These are attribute selectors, so an
element carrying one whose directive was never imported compiles cleanly and
silently does nothing. Spreading a family is the cheapest guard:

```ts
imports: [...UNI_LAYOUT]
```
