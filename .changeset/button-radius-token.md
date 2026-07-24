---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Button corner rounding and typography conform to component-options tokens

- `button` and `iconButton` themes gain `options: { borderRadius: 'max' }`; the hardcoded
  per-size pixel radii (11/13/18/24) and the icon button's inline `borderRadius: 999` are
  removed. Components resolve the token through `theme.radius()`, so the theme's radii
  scale — shape languages (`sharp` → square, `playful` → pill) and custom radii
  primitives — now restyles buttons like every other tokened component.
- Back-compat: the options radius is applied before theme `sizes`/`fixed` styles, so
  hand-authored themes that still set a size-level `borderRadius` keep winning; icon
  buttons fall back to the legacy circle when a theme predates iconButton options.
- `button` themes also gain `options: { typeface: 'button' }`: the hardcoded
  `fontFamily: 'Euphemia'` (a font no theme loads) is removed from `fixed` and the sizes;
  labels now render the type scale's `button` role (Red Hat Display, medium, capitalize),
  with per-size `fontSize` still applied by `sizes`. Point the token at any typography
  role — including custom ones — to restyle every button label.
- New `UniButtonOptions` interface (`borderRadius`, `typeface`) exported from the button
  model.
