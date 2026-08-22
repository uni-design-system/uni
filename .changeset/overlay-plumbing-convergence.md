---
'@uni-design-system/uni-angular': patch
---

`uni-dropdown` now uses the CDK's overlay helpers instead of its own copies of
them. It predates `cdk/overlay`, so it had been carrying a duplicate
placement-to-`transform-origin` map, a duplicate focus-restore rule, a
duplicate discrete-transition block, and hand-written anchor and toggle-state
code. `TRANSFORM_ORIGINS` had no consumers at all as a result — the shared
constant existed while the one component that needed it used its own copy.

No behaviour change: the dropdown's 100 ms linear scale-and-fade, its measured
transform origin, its focus restore and its ARIA wiring are all identical,
verified against the rendered styles. Every export in `cdk/overlay` now has a
consumer, and the component is 35 lines shorter.

`discreteOverlayTransition()` takes an optional fourth argument, a
`transition-timing-function`. Omitted, nothing is emitted and the CSS initial
value stands, so existing callers are untouched.

One real inconsistency fixed along the way: the listbox popups
(`uni-combobox`, `uni-search-input`, `uni-tag-input`, `uni-time-input`) were
introduced to match `uni-dropdown`'s animation but ran on the default `ease`,
while the dropdown uses `linear` — so a combobox and a multi-select dropdown
in the same form opened at visibly different rates. They now share the
dropdown's easing exactly.
