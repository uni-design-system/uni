---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

New `uni-slider` component — clears the declared-but-unbuilt `ComponentName` entry

- Native `<input type="range">` under the hood: platform keyboard interaction
  (arrows, Home/End, Page Up/Down) and ARIA slider semantics for free; Signal Forms
  contract (`FormValueControl<number>`) matching Input/Textarea.
- `min`/`max`/`step` inputs (fractional steps supported), required accessible `label`.
- Token-driven via `slider.options`: fill/thumb `color`, `trackColor`, `borderRadius`,
  and geometry (`trackHeight`, `thumbSize`). The fill level rides a CSS custom
  property, so dragging never regenerates Emotion styles; Firefox uses the native
  `::-moz-range-progress`, WebKit a gradient stop.
