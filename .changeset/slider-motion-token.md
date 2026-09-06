---
'@uni-design-system/uni-angular': major
'@uni-design-system/uni-core': major
---

Move `uni-slider`'s click-to-jump timing onto the `motion` scale. The `slider.transitionMs` theme option is removed; use `slider.motion` — a token name — instead.

It was the last duration option outside the scale. The other eight went in 9.0.0, but the slider was rewritten for the numeric family afterwards and reintroduced its own, so a theme could retime every animated component except this one.

The scale gains a sixth token for it, `snap` (120ms `ease`), which is the slider's exact previous timing — nothing moves faster or slower than before. It is a separate token rather than a reuse of `control` because the two describe different motion: `control` times a state change in place (a hover fill, a check mark) and runs 300ms, where a slider thumb covers distance to a value the user just chose and at 300ms reads as lagging the input rather than answering it. A drag is still never animated.

Themes setting `slider.transitionMs` should set `motion.snap` instead, which also retimes anything else pointed at that token.
