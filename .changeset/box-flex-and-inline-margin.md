---
'@uni-design-system/uni-angular': minor
---

Box learns `flex` / `shrink` / `basis` and `marginInline`.

**`flex`.** `grow` emits `flex-grow` alone, which leaves `flex-basis: auto` — so
it cannot express `flex: 1`, and any layout wanting siblings to share space
evenly regardless of content width had to stay in CSS. `[flex]="1"` now emits
the shorthand; `shrink` and `basis` cover the rest. `grow` is unchanged, so no
existing layout moves.

These three go through a new `ThemeService.styleIfSet()`, which treats only
`undefined` as unset — the shared `style()` helper drops falsy values, which
would have silently swallowed `[shrink]="0"`, the single most useful value.

**`marginInline`.** `margin: 0 auto` on a max-width container had no Box
equivalent, so page shells kept an inline style for it. `marginInline="auto"`
centers such a container, and a spacing token works too.

```html
<main box-layout maxWidth="1200px" marginInline="auto" padding="lg">…</main>
```

Only the inline axis is exposed. Block margins collapse and fight `gap`, which
is why the primitives carry no margin otherwise — inline margins do neither, so
this is a deliberate line rather than a crack in the token-only surface.
