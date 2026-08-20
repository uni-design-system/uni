---
'@uni-design-system/uni-angular': patch
---

`uni-calendar` / `uni-date-input`: a bound `''` now counts as "no value".

An empty string — the only typeable empty for a string-typed model, and the natural "no value yet" in consumer code — slipped past the month path's nullish (`??`) guards into the grid math: `viewMonth` became `''`, the month heading threw `RangeError: Invalid time value` from `Intl.format` on every change-detection pass, and the grid rendered zero weeks. This hit on first render (the popup content projects eagerly), not just on open. The guards are now falsy, matching how `displayText`, `splitDateTime`, and the rest of the datetime path already treat `''`, so a calendar or date-input bound to `''` renders the current month exactly like `undefined`. `uni-time-input` and `uni-date-time-input` were already safe. Consumers no longer need to normalize `''` to `undefined` before binding — and note the `value` models were always typed `UniDate | undefined`, so no `$any()` cast is needed for a `string | undefined` draft signal.
