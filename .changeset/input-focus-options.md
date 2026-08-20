---
'@uni-design-system/uni-angular': minor
---

Themable focus chrome for input boxes: `focusBorder`, `focusShadow`, `focusColor`.

The `input` component options could previously restyle focus only through `focusOutline`/`focusOutlineOffset`. The new optional trio mirrors the error-state trio (`errorBorder`/`errorShadow`/`errorColor`) and applies while any projected control has focus: `focusBorder` swaps the border primitive, `focusShadow` draws a ring (e.g. a soft `0 0 0 3px` spread), and `focusColor` swaps the background. All three default to `undefined`, so existing themes render exactly as before, and they yield to the error state so a flagged field stays visibly flagged while being corrected.

The Wellsourced showcase theme now uses them for its app's `.search-input:focus` look — an ochre (`secondary`) 1px border with a 10% ring of the same hue and the box snapping to the clean surface — via new `inputFocus` border and shadow primitives, tinted per palette in light and dark.
