---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Overlay timing is now a theme token. `UniTheme` gains a `motion` scale
alongside `radii`, `shadows` and the rest, and the overlays point at it by
name instead of carrying their own hardcoded durations.

Until now a theme could slow a skeleton shimmer but not a dropdown: `expand`,
`skeleton` and `callout` each exposed their own motion option while
`uni-dropdown` hardcoded 100ms and the combobox-style listbox popups copied
that constant. Retiming the library meant editing components.

Two tokens ship, because two things genuinely move differently — a small panel
attached to a control snaps, a larger free-floating surface settles:

| Token   | Default            | Used by                                            |
| ------- | ------------------ | -------------------------------------------------- |
| `popup` | 100ms linear, ×0.8 | dropdown, menu, multi-select, combobox, search-input, tag-input, time-input |
| `panel` | 250ms ease         | popover                                            |

A token carries `duration` (ms), `easing`, and an optional `scale` for panels
that grow into place — one token rather than separate duration and easing
scales, because they are one design decision: slowing a panel without
softening its curve reads as sluggish rather than calm.

```ts
createTheme({
  id: 'Calm',
  name: 'Calm',
  colors,
  motion: { popup: { duration: 240, easing: 'ease-out', scale: 0.95 } },
});
```

Tokens you don't restate keep their base values, and a component can still
point at a token of its own through its `motion` option.

Nothing moves differently by default — every current duration, easing and
scale is preserved exactly, verified against the rendered styles. Themes that
predate the scale keep working: `createTheme` fills it in, the validator does
not require it, and a theme registered as JSON without it resolves to the base
timing rather than failing. `motionSafe` remains the floor, so a theme decides
how overlays move for people who want movement, never whether they move at
all.

`callout`'s existing `transitionMs` option and the `expand`/`skeleton`
durations are untouched for now; folding them into this scale is a follow-up.
