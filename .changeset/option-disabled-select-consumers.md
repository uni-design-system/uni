---
'@uni-design-system/uni-angular': minor
---

`Option.disabled` now works in the three remaining `Options<T>` consumers, not
just `uni-combobox`: `uni-select`, `uni-multi-select-dropdown` and
`uni-multi-select`. Marking an individual choice `disabled` shows it without
offering it — the plan that needs an upgrade, the channel that needs a verified
phone number — instead of dropping it from the array and leaving the list
lying about what exists.

`uni-select` passes it to the native `<option>`, so the platform handles
skipping, greying and announcement. The two multi-selects disable the option's
checkbox and refuse the toggle even when called directly. In
`uni-multi-select-dropdown` the arrow keys step over disabled rows and Home/End
land on the nearest enabled option — `ListboxNavigation` already knew how, it
just was not being told which rows were disabled — so focus never parks on a
checkbox that cannot take it.

`selectAll()` on both multi-selects now selects only enabled options. A
disabled option is not committable, so nothing may commit one on the user's
behalf; `deselectAll()` still clears everything. If you relied on `selectAll()`
returning every value including disabled ones, note that only options you have
explicitly marked `disabled` are affected. Whole-field `disabled` is unchanged
and still disables the entire control.
