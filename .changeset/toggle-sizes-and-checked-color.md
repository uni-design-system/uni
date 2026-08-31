---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

`uni-toggle` honours `size`, and the checked colour has a theme home.

**`size` did nothing.** `uni-toggle` inherits a bindable `size` input from
`BaseComponent`, but its geometry came from a single `toggle.behavior.size`
number, so `<uni-toggle size="sm">` compiled, read as deliberate, and rendered
identically to every other switch. The theme now carries a `sizes` block and the
input selects from it.

**Geometry is stated per size, not derived from ratios.** Each size token is a
`width` / `height` / `padding` triple — `padding` being the knob's inset — and
the rest falls out: knob is `height - 2 * padding`, travel is `width - height`,
radius is `height / 2`. Real switch designs do not hold a constant proportion
across sizes (a consumer's 32x18 and 28x16 pair differs in both track and knob
ratio), so a single ratio token could match one size or the other but never
both.

`lg` is `BaseComponent`'s default and reproduces the previous geometry exactly —
40x20, knob 16 — so **no existing toggle moves**. A theme still setting the
legacy `toggle.behavior.size` number keeps the old derived-ratio behaviour; that
option is now deprecated in favour of the `sizes` block.

**Fixed: the knob would have overhung the track at any other proportion.** The
checked transform was hardcoded to translate by one track height, which is only
correct while the track is `2x` wide and the knob `0.8x`. It is now derived, so
the knob lands the same distance from each edge at every size.

**New `checkedColor`, as an input and a theme option.** The on-state used to be
the instance's `variant`, which meant an app wanting one switch colour repeated
an attribute on every call site. `toggle.behavior.checkedColor` sets it once;
the input overrides per instance; `variant` remains the fallback when neither is
set. The focus ring follows the resolved colour rather than staying on `variant`.
An input as well as an option is necessary because `variant` defaults to
`'primary'` and so cannot be distinguished from unset — without one, a themed
`checkedColor` would have silently made `variant` inert with no way back.

**Toggle transitions are a motion token.** It hardcoded `0.3s ease` while
`uni-radio` already read `theme.motion(options.motion ?? 'control')`, so a theme
setting a motion scale moved the radio and not the switch.
