---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

`uni-alert`, `uni-snackbar`, `uni-radio` and `uni-menu-item` now read their
timing from the theme's `motion` scale, which completes the migration: every
animated component in the library is retimed from one place.

Two tokens join `popup`, `panel` and `reveal`:

| Token          | Default           | Used by          |
| -------------- | ----------------- | ---------------- |
| `notification` | 350ms ease-in-out | alert, snackbar  |
| `control`      | 300ms ease        | radio, menu-item |

**One thing moves differently:** `menu-item`'s hover transition goes from
0.35s to 0.3s, joining `radio` on the shared `control` token. The two were
never deliberately different — `radio`'s own option documented its 0.3 as
"matching menuItem", which was not true — so this corrects drift rather than
changing a decision. A theme that wants the old timing can set the deprecated
`transitionSpeed`, or retime `control`. Everything else is byte-identical,
verified against the rendered styles.

**Deprecated, still honoured, removed next major:**
`alert.transitionSpeed`, `snackbar.transitionDelay`, `radio.transitionSpeed`
and `menuItem.transitionSpeed` all still work and still outrank `motion`, so a
theme that set them keeps its exact timing. `menu-item`'s escape hatch is
intact too: with neither the option nor a token set it still renders no
transition at all, and a token with `duration: 0` is the way to ask for
instant now.

`card.transitionSpeed` and `input-box.transitionSpeed` are also deprecated,
for a different reason: **neither was ever read by its component.** Setting
them has never had any effect. They are removed next major and nothing needs
to replace them.

`uni-skeleton` is deliberately left out. Its shimmer is a loop rather than a
transition, and folding a repeating animation into a scale built around
entering and leaving would make the scale mean two different things.
