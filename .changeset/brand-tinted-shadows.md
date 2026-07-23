---
'@uni-design-system/uni-core': minor
---

Brand-tinted, theme-scoped elevation shadows (PRD §3.5.C)

- New `generateShadows(colors, mode)`: light themes replace the dead-neutral
  `rgba(0,0,0,…)` stacks with a shadow ink pulled toward the brand hue; dark themes go
  near-zero (`raised: none`) with only a faint veil on floating overlays — elevation
  reads from the surface lightness steps instead. The `warn` glow is tinted with the
  theme's own error color in both modes.
- `generateThemes` now returns `lightShadows`/`darkShadows`; `generateUniThemes`,
  `createThemeFromPalette` (Theme Builder), the emitted `uni-theme.ts`, and the shipped
  stock Light/Dark themes all carry them.
