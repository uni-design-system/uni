---
'@uni-design-system/uni-angular': patch
---

`uni-text`'s `nowrap` now works as a bare attribute: `<span uni-text nowrap>` keeps the text on one line, and leaving it off lets the text wrap.

Without a transform, a valueless attribute binds as the empty string, which is falsy, so `nowrap` on its own compiled and silently did nothing. It now uses `booleanAttribute`, like `fullWidth`, `disable` and `loading`, and is typed `boolean` (default `false`). `[nowrap]="true"` and `nowrap="false"` behave as before.
