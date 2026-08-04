---
'@uni-design-system/uni-angular': patch
---

Tooltip no longer blinks after activating a wrapped control

Clicking a button inside `uni-tooltip` used to fall through to the bubble's
tap-to-toggle handler and then re-show on the still-hovering pointer — a
state-flipping label ("Expand" → "Collapse") visibly blinked off and back on
after the click.

- **Activating an interactive element inside the host now hides the bubble
  and suppresses it** until the pointer leaves and returns (or focus moves
  away). Tap-to-toggle is unchanged for non-interactive hosts (inline text).
- **`expand-toggle` drops its icon-only tooltip.** The rotating chevron plus
  `aria-expanded` and the button's accessible name already say everything the
  bubble restated; use the `label` input when a disclosure needs a visible
  name.
