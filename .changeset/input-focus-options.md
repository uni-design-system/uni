---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Themable focus chrome: a shared `focusRing` primitive for every control, plus `focusBorder`/`focusShadow`/`focusColor` options for input boxes.

**Shared focus ring.** A theme can now restyle the keyboard-focus indicator across the whole library by defining `focusRing` **border** and/or **shadow** primitives: `ThemeService.focusRing()` (and the new selector-less `focusRingStyle()`) replaces its default 2px outline with that border — drawn as an outline hugging the control — plus the ring shadow. A `focusRing` **thickness** primitive sets the ring's outline offset (negative values overlay the control's resting border, reading as a border-color change). Checkbox, radio, toggle and slider now route their hand-rolled focus styles through the shared helper (calendar days and tag chips already did), so one primitive trio gives every control the same focus language. Themes without the primitives render exactly as before.

**uni-core:** `Thicknesses` is now an open record like `Borders`/`Shadows` (extra named primitives allowed), and `createTheme` accepts a sparse `thicknesses` override merged over the base scale.

**Also in this release:**

- Radio and toggle scope their transitions (border/background/transform) instead of `all`, so the focus ring's outline and shadow apply instantly — `transition: all` interpolated the outline from a stale color, flashing a dark ring before the themed ring color landed.
- The radio's dot grow/retract animation is a token — `radio.options.transitionSpeed` (seconds, default 0.3 preserving the current feel; 0 switches instantly).
- The checkbox focus ring rounds proportionally again (box radius plus its gap) and the gap itself is a new `checkbox.options.focusRingGap` option; a `focusRingStyle` call's explicit gap wins over the theme's `focusRing` thickness, then the branch defaults.

The `input` component options could previously restyle focus only through `focusOutline`/`focusOutlineOffset`. The new optional trio mirrors the error-state trio (`errorBorder`/`errorShadow`/`errorColor`) and applies while any projected control has focus: `focusBorder` swaps the border primitive, `focusShadow` draws a ring (e.g. a soft `0 0 0 3px` spread), and `focusColor` swaps the background. All three default to `undefined`, so existing themes render exactly as before, and they yield to the error state so a flagged field stays visibly flagged while being corrected.

The Wellsourced showcase theme now defines the `focusRing` pair for its app's `.search-input:focus` look — an ochre (`secondary`) 1px border with a 10% ring of the same hue, tinted per palette in light and dark — so text fields (which rest on a canvas tint and snap to the clean surface on focus), checkboxes, radios, toggles, sliders, calendar days and tag chips all share one focus treatment.
