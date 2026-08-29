---
'@uni-design-system/uni-angular': major
'@uni-design-system/uni-core': major
---

`uni-slider` is rebuilt on custom thumbs instead of `<input type="range">`,
gaining range mode, marks, a value readout and an exact decimal step model. This
is a breaking change to both the component's value shape and its theme options.

**Why it could not stay native.** One `<input type="range">` cannot carry two
thumbs, so range mode, thumb crossing and per-thumb ARIA bounds were all
unreachable; marks and a value tooltip were unstyleable through it. The
alternative — a second component for the range case — would have meant two
keyboard implementations to keep in step, which is the drift the shared step
model exists to prevent. What the platform was giving us (the slider ARIA
pattern and the keyboard map) is reimplemented explicitly and covered by 29
specs.

**Breaking: value shape.**

```ts
// before
value = model<number>(0);
// after — the shape follows `mode`, and `null` is empty
value = model<number | UniNumberRange | null>(null);
```

A `single` slider still reads and writes a plain number, so
`[(value)]="volume"` is unchanged. Code that relied on `value()` being
non-nullable, or that read it without narrowing, now needs to handle `null` and
the `{ start, end }` range.

**Breaking: theme options.** `slider.options.color` is **removed**. Fill and
thumb colour now come from the `variant` role pair, the rule every other
component follows, so `variant="warn"` recolours a slider with no theme edit. A
theme that set `color` should delete it and pass `variant` at the call site.
`trackColor` now defaults to `primary-container` rather than `surface-variant`.

New options: `thumbBorderRadius`, `minTouchTarget`, `markSize`, `markColor`,
`labelTypeface`, `labelColor`, `tooltipColor`, `tooltipTextColor`,
`tooltipShadow`, `tooltipBorderRadius`, `transitionMs`. `trackHeight`,
`thumbSize` and `borderRadius` are unchanged.

**New capability.**

- `mode="range"` — two thumbs, a `{ start, end }` value, `minGap` to fence the
  ends apart. Thumbs may cross and swap, and the dragged one keeps focus.
- `marks` and `snapToMarks` — labelled stops, spoken in place of the number.
- `valueDisplay` — `none`, `inline`, `tooltip`, or `input`, which seats a
  compact `uni-number-input` at the trailing edge, two-way bound to the same
  value: drag for the ballpark, type for the exact figure. Single mode only.
- `origin` — anchor the fill somewhere other than `min`, for sliders spanning ±.
- `sliding` and `changed` outputs, replacing an implicit per-frame model write.
  **Bind `changed` in forms**; `sliding` fires every frame of a drag.
- `largeStep`, defaulting to a tenth of the range, for `PageUp`/`PageDown` and
  `Shift+Arrow`.
- Right-to-left support: the horizontal arrows and the track mirror; the value
  does not.

**Also new: the `cdk/number` primitives** this is built on, shared with the
numeric input family still to come — exact scaled-`BigInt` decimal arithmetic
(`stepDecimal`, `roundDecimal`, `clampDecimal`), locale-aware
`parseNumber`/`formatNumber` over `Intl`, and `createPressRepeat` for
hold-to-repeat stepper buttons. Stepping `0.1` twenty times from `0` now lands
on exactly `2`, and `1.15` rounds to `1.2` where `(1.15).toFixed(1)` gives
`'1.1'`.
