---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

`expand` gains a themable, size-aware speed

The reveal/collapse duration was hardcoded at 350ms, so a consumer wanting a
snappier disclosure — or wanting adjacent styling to fade on the same clock —
had nothing to reference. A fixed duration also reads differently at different
sizes: sluggish on a two-line region, rushed on a full-page one.

- **New `transitionSpeed` option in the `expand` theme options** (seconds,
  default `0.35`, matching alert/card `transitionSpeed`) sets the base
  duration. `'expand'` joins core's `ComponentName` union, so custom and
  derived themes can type an `expand` entry.
- **Duration scales with content height.** The actual duration is
  `transitionSpeed × √(height ÷ 240px)`, clamped to ~0.15–0.6s at the default
  speed (the envelope scales proportionally with a themed speed), so perceived
  speed stays steady across region sizes. The curve and its constants
  (`expandDuration`, `EXPAND_DEFAULT_SPEED`, `EXPAND_MIN_DURATION`,
  `EXPAND_MAX_DURATION`, `EXPAND_REFERENCE_HEIGHT`) are exported from
  uni-core.
- **New per-instance `transitionSpeed` input** sets an exact duration for one
  region, bypassing the scaling: `<uni-expand [transitionSpeed]="0.15">`.
- **The resolved duration is exposed as the public `duration` signal** on
  `uni-expand`, so adjacent styling can move on the reveal's clock with a
  plain binding — `[style.transition-duration]="expand.duration() + 's'"` —
  keeping all timing in the theme/signal pipeline, with no custom CSS.
- **`expand-toggle` gains a matching `transitionSpeed` input** and otherwise
  follows the theme token instead of its own hardcoded 350ms. Expand Area
  binds the region's resolved `duration` to its toggle, keeping chevron and
  reveal on one clock even when size-scaled or overridden.
- **Speed is theme-reactive**: swapping themes at runtime retimes regions and
  chevrons live.
- **Enter/leave easing is now `ease-in-out`** (was `ease-in`), matching the
  chevron rotation so trigger and region decelerate together.
- **`UniExpandOptions` is exported** from uni-angular for
  `getComponentOptions<UniExpandOptions>('expand')` consumers.
