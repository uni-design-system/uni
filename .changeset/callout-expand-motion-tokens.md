---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

`uni-callout` and `uni-expand` now read their timing from the theme's `motion`
scale, so every animated surface in the library is retimed from one place.
They were the last two carrying their own motion options — in different units,
under different names (`transitionMs` in milliseconds, `transitionSpeed` in
seconds).

A third token joins `popup` and `panel`:

| Token    | Default           | Used by               |
| -------- | ----------------- | --------------------- |
| `reveal` | 350ms ease-in-out | expand, expand-toggle |

`reveal` is a *base* speed, not a final duration: `uni-expand` still scales it
by content height (√-of-height, clamped) so short regions stay snappy and tall
ones aren't rushed, and its easing now drives the reveal curve, which was
hardcoded. `uni-expand-toggle` resolves the token the same way, so the chevron
and the region cannot drift apart. `uni-callout` maps onto `panel`, whose
250ms matches what it already used.

**Not breaking.** `transitionMs` and `transitionSpeed` are deprecated but
still honoured, and deliberately outrank `motion` — a theme that set either
keeps precisely its current timing rather than being retimed underneath it.
They are removed next major. Per-instance inputs, like `uni-expand`'s
`transitionSpeed`, still outrank everything.

Nothing moves differently by default: callout renders 0.25s ease and expand
0.35s ease-in-out exactly as before, verified against the rendered styles.
