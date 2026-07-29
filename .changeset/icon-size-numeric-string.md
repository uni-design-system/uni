---
'@uni-design-system/uni-angular': patch
---

Fix `uni-icon` ignoring `size="24"` written as a static attribute

`size` appended `px` only to numbers, but a static template attribute arrives as
a string — so `<uni-icon name="mail" size="24" />` emitted the invalid
`width: 24`. Browsers drop an invalid declaration, which silently fell back to
the stylesheet's `width: 100%; height: 100%`.

That failed in two different ways depending on the container, neither of them
obvious: inside a fixed box the icon quietly filled it (a 16px glyph rendering
at 30px), and inside a content-sized flex row `height: 100%` collapsed to zero,
so the icon vanished while still occupying full width and pushing its label
across the row.

A bare numeric string is now treated as px, matching the number form. Genuine
CSS lengths (`'1.25rem'`, `'50%'`, `calc(…)`) still pass through untouched.
`[size]="24"` was unaffected throughout, since property binding passes a real
number.
