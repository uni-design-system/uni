---
'@uni-design-system/uni-angular': patch
---

New **Experiments → Forms layout pressure** docs page: every form control in an
`auto 1fr` grid, with a bar showing what it left for its sibling.

It exists to make one class of bug visible, because nothing else can see it. A
`1fr` track is `minmax(auto, 1fr)`, and that `auto` floor is the control's own
min-content size — so a control reporting a larger intrinsic width than it needs
quietly steals track width from whatever sits beside it, while still looking
correct in isolation. That shipped once: `uni-quantity-stepper`'s value cell is a
native `<input>` defaulting to `size="20"`, so it measured ~230px instead of
~92px and collapsed a consumer's grid column.

Neither the specs nor `build-storybook` catch it — the specs assert computed
styles and ARIA, and jsdom does not do layout — so it took a consumer report.
The page is deliberately width-constrained, since on a wide canvas nothing
competes for the track and the defect cannot appear. The measurements are live
and update as the viewport changes.
