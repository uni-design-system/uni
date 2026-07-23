---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Theme Builder becomes the full playground (PRD §5.2)

- **Light & dark side by side**: both palettes generate on every input change,
  independent of the storybook-wide mode toggle, each rendered in its own panel.
- **Contrast report panel**: live pass/fail matrix over all checked pairs (summary +
  failing rows always visible, full detail on demand). Failures only occur with hard
  brand pins; the panel says so and points at soft targets.
- **Shape language input** (`sharp`/`modern`/`playful`): applies `ShapeRadii` live via
  the new `radii` pass-through on `BrandPaletteConfig`/`createThemeFromPalette`.
- **Export paths**: copy the static `uni-theme.ts` (via `emitThemeFile`), copy a
  pre-encoded `ng add` command, or copy W3C DTCG JSON for both modes via the new
  `emitDtcgTokens()` interop emitter in uni-core (Style Dictionary compatible).
