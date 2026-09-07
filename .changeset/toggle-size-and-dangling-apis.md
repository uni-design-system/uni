---
'@uni-design-system/uni-angular': major
'@uni-design-system/uni-core': major
---

Remove the deprecated `toggle.size` theme option and wire up three component names that were declared but unreachable.

`toggle.size` was the last `@deprecated` API in the library — the pre-`sizes` geometry (width 2x, knob 0.8x) that outranked the size block for every instance regardless of a toggle's own `size` input. No shipped theme set it. Use the `toggle.sizes` block, which gives each size token its own `width` / `height` / `padding`.

`select`, `buttonGroup` and `progressBar` were listed in `ComponentName` with no theme entry and no `COMPONENT_NAME` provider behind them, so a theme could not dress them however it tried. Each now has an entry whose defaults are exactly what the component previously hardcoded, so nothing moves:

- **`select`** — `toggleIcon`, `toggleColor`, `toggleSize` for the dropdown affordance, matching `uni-combobox`'s (`chevronDown`, `on-background-variant`, 20).
- **`buttonGroup`** — `border` and `borderRadius` for the segmented frame, previously a literal `quaternary` border and 4px corners.
- **`progressBar`** — `trackColor`, `fillColor`, `completeColor`, `borderColor` and `strokeWidth`, previously read straight off the palette.

The two remaining names are dealt with separately: `textButton` is renamed `inlineButton` and now backs the new `uni-inline-button`, and `footer` is removed from `ComponentName` altogether.
