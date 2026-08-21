---
'@uni-design-system/uni-angular': minor
---

`uni-combobox` — the form-bound, closed-set, single-select autocomplete. `FormValueControl<T | null>` over the cdk's object `Options<T>`, so it drops into Signal Forms via `[field]`; minimum usage is `<uni-combobox label="State" [options]="states" [(value)]="state" />`. Typing filters, it never selects: the draft commits on an active option, a unique exact label match, or (Enter only) a filter narrowed to one enabled option; anything else reverts and emits `(rejected)`. The value contract is identical to `uni-select` (`T | null`, `compareWith`), so swapping one for the other as a list grows is a template-only change. Filtering is local by default; `[filterLocally]="false"` renders `options` verbatim and the app narrows them from the debounced `(query)` output — the async/server-side story. Glyphs are theme icon primitives (`toggleIcon`/`clearIcon`/`selectedIcon`) rendered by `uni-icon`.

Supporting cdk changes, both non-breaking:

- `Option<T>` gains optional `description` (secondary line, read as part of the option's name) and `disabled` (visible and announced, not committable).
- `ListboxNavigation` accepts a `disabled?: (index) => boolean` config hook — arrows skip disabled options, `Home`/`End` land on the nearest enabled one, an all-disabled list never activates. Existing consumers pass nothing and behave identically.
