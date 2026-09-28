---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

`uni-slider` gains theme options to restyle the thumb: `thumbColor`, `thumbBorderColor`, `thumbBorderWidth` and `thumbShadow`.

The thumb was always a solid dot in the variant's color, ringed 2px in the page background. That stays the default. A theme can now invert it, for example a white `surface` dot ringed in the variant with a soft lift. The color options take any color token, or `'fill'` for the variant's color, so a ringed thumb still recolors with `variant="warn"`.

`trackColor` now accepts any color token rather than only container tokens, so a hairline such as `outline` can draw the groove. Existing values still type-check.
