---
'@uni-design-system/uni-angular': patch
---

`uni-slider` no longer shows the browser's default focus outline when the thumb is grabbed with a pointer.

11.4.0 withheld the ring on a pointer grab by dropping the thumb's `:focus-visible` rule. But that rule is also what replaces the browser's own outline, so with it gone Chrome painted its default: a thick solid blue ring, worse than the themed one it replaced. A grab now keeps the rule and blanks it (`outline: none`, `box-shadow: none`). Keyboard focus rings as before. The specs now assert what the rule draws rather than whether it exists, since jsdom has no user-agent outline to expose the difference.
