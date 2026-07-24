---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

New `uni-tabs` / `uni-tab` components

- Full WAI-ARIA tabs pattern: `tablist`/`tab`/`tabpanel` roles with wired
  `aria-selected`/`aria-controls`/`aria-labelledby`, roving tabindex, automatic
  activation on ArrowLeft/ArrowRight (wrapping, disabled tabs skipped), Home/End,
  and motion-safe transitions.
- `selectedIndex` is a two-way `model()`; selection snaps to the nearest enabled tab.
  Panel content is captured per-tab and only the selected panel is instantiated.
- Every visual knob is a theme option token (`tabs.options`): `typeface`, `textColor`,
  `activeTextColor`, `indicatorColor`, `indicatorThickness` (thickness token),
  `divider` (border primitive), `gap`/`padding` (spacing tokens), `borderRadius`, and
  optional `activeColor` — the defaults render underline tabs; `borderRadius: 'max'` +
  `activeColor` turns them into segmented pills with no component changes.
