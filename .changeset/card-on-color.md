---
'@uni-design-system/uni-core': patch
---

Fix unreadable text in `uni-card` under dark themes. The card's theme entry painted `backgroundColor` without the matching `color`, so any unstyled text inside it fell back to the user-agent default black. On a light theme that happened to read; on every dark theme it rendered black on a near-black surface — 1.11:1 against a 4.5:1 AA requirement, reported from the theme switcher's preview card.

The card now states `on-background` alongside its background, as `cardHeader` already did for each of its variants. All six registered themes measure between 13.8:1 and 18.1:1 on that text.

Added with the fix: a spec asserting the invariant across every component entry in the shipped themes — anything that paints a `backgroundColor` must also state a `color` — so the next half-painted surface fails a test rather than reaching a consumer.
