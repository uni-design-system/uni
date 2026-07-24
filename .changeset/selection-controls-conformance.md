---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Checkbox, radio, and toggle conform to theme tokens

- The last hardcoded control colors (`#FFF`, `#ccc`, `#d0d0d0`, `#e0e0e0`,
  `rgba(0,0,0,0.2)`) are gone. Chrome now resolves from new option tokens —
  checkbox `boxColor: 'surface'`; radio `ringColor: 'outline'` / `fillColor:
  'surface'` (radio gains a theme entry for the first time); toggle `trackColor:
  'surface-variant'` / `knobColor: 'surface'` — so all three finally render
  correctly on dark and brand themes.
- The checkbox's check/dash strokes wear the variant's paired on-color
  (`on-primary`, `on-warn`, …) instead of assuming white; disabled states use the
  `disabled`/`on-disabled` tokens; the toggle knob's shadow is the theme's
  brand-tinted `raised` stack, and its hover uses the button convention's
  brightness filter instead of a fixed grey.
