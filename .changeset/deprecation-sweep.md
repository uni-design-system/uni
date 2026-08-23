---
'@uni-design-system/uni-core': major
'@uni-design-system/uni-angular': major
'@uni-design-system/uni-react': major
---

Every deprecated API is removed. The library now carries no `@deprecated`
symbols at all.

**Per-component duration options → the `motion` scale.** Six components carried
their own duration knob that predated the motion scale and *won over* it:
`expand.transitionSpeed`, `callout.transitionMs`, `radio.transitionSpeed`,
`menuItem.transitionSpeed`, `alert.transitionSpeed` and
`snackbar.transitionDelay`. All are gone, along with the precedence branch each
one required — timing now comes from the token, full stop.

Retime the token instead; one edit covers every component pointing at it. To
retime a single component, define a token of your own and point that
component's `motion` option at it:

```ts
createTheme({
  …,
  motion: { productive: { duration: 110, easing: 'ease' } },
  components: { menuItem: { options: { motion: 'productive' } } },
});
```

A `duration: 0` token is how a theme opts out of motion — that is what
`transitionSpeed: 0` used to mean. Both showcase themes are migrated this way
(Carbon to a 110ms `productive` token, Wellsourced to an `instant` one).

**Options that never did anything.** `card.transitionSpeed` and
`inputBox.transitionSpeed` were read by nothing and never had been. Delete them
from your theme; nothing replaces them.

**Renames and obsolete APIs**

- `inputBox.typeFace` → `typeface` (the casing every other component uses).
- `uni-tooltip`'s `appendToBody` input — inert since the tooltip moved to the
  native top layer, which escapes any overflow context by itself.
- Box's `elevation` input → `shadow`, in both the Angular and React packages.
  It was a second name for the same thing.
- The Angular `icons` re-export → import `BaseIcons` from
  `@uni-design-system/uni-core`. The default set ships with every theme.

**The HSL color legacy is gone from uni-core.** `uniColor`, `randomRangeValue`,
`CategorySaturation` and `CategoryLightness` are removed, superseded by the
deterministic OKLCH engine (`generateThemes` / `generatePalette`) — same input,
same theme, WCAG-checked. `RoleHues` and the `UniColor` type go with them: they
were reachable only through `uniColor`, and `RoleHues` had gone stale enough to
hold saturation values in a table of hues.

**Deferred output renames.** Three outputs were held back because renaming is
breaking; this is that release. Each also drops an eslint escape it needed for
shadowing a native event name or using an `on` prefix.

| Component | Before | After |
|---|---|---|
| `uni-debounce-input` | `(change)` | `(valueChange)` |
| `uni-search-input` | `(change)` | `(searchChange)` |
| `uni-search-input` | `(search)` | `(searchSubmit)` |
| `dragAndDrop` | `(onFileDropped)` | `(fileDropped)` |

**`uni-dropdown`'s `color` input → `containerColor`,** completing the rule the
layout directives set: every container-pair input in the library is now
`containerColor`, and plain `color` always means the CSS property.

**`ThemeService.getSpacing('none')` now returns `0`, not the string `'none'`.**
`'none'` is not a valid length, so it was silently dropped wherever it landed —
`uni-menu` carried a comment working around exactly that, which is now deleted.
