---
'@uni-design-system/uni-angular': patch
---

`uni-text`'s `nowrap` and `ellipsis` now work as bare attributes: `<span uni-text nowrap>` keeps the text on one line, `<span uni-text ellipsis>` truncates overflow, and leaving either off turns it off.

Without a transform, a valueless attribute binds as the empty string, which is falsy, so either attribute on its own compiled and silently did nothing. Both now use `booleanAttribute`, like `fullWidth`, `disable` and `loading`, and are typed `boolean` (default `false`). `[nowrap]="true"`, `[ellipsis]="true"` and the `="false"` forms behave as before.
