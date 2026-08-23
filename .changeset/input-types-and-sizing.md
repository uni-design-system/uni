---
'@uni-design-system/uni-angular': major
---

`uni-input` gets a `type`, and the input chrome stops needing a wrapper div.

**Types.** `uni-input` was text-only with no `type` at all, so every email, URL,
number and phone field had to fall back to `uni-input-box` plus a hand-written
native `<input>`, and `type="password"` could not go through it. It now takes
the text-like types: `text` (default), `email`, `password`, `search`, `tel`,
`url`, `number`.

Non-text types (`checkbox`, `radio`, `file`, `range`, `color`) stay out — they
break both the input chrome and the `FormValueControl<string>` value contract —
as do `date` / `time` / `datetime-local`, which have dedicated components.

**Native passthroughs.** `autocomplete`, `inputMode`, `list` (a `<datalist>` id),
`step` and `spellcheck` are plain passthroughs; an unset one emits no attribute.
`readonly`, `name`, `min`, `max`, `minLength`, `maxLength` and `pattern` are
Signal Forms' own optional control inputs, so the `[field]` directive syncs them
from your validators exactly as it already syncs `required` — and they are
reflected onto the native element so the browser contributes too. Signal Forms
treats multiple `pattern`s as all-must-match, which the native attribute cannot
express, so it is reflected only when there is exactly one.

`uni-textarea` gains `readonly`, `name`, `minLength`, `maxLength`, `autocomplete`
and `spellcheck`; `uni-debounce-input` gains `type`, `autocomplete` and
`inputMode`.

**Sizing.** `uni-input-box`'s host is `display: contents`, so a width or layout
attribute set on the element itself was silently dropped and every call site
needed a wrapper `<div>`. It now takes `width`, `fullWidth` and `grow` (joining
`minWidth`), which reach the real box inside; `uni-input`, `uni-textarea` and
`uni-select` forward all four. The `display: contents` behavior is now documented
too — it stays surprising even once sizing works.

Both `uni-input` and `uni-debounce-input` now accept the adornment slots as
either element or attribute selectors (`<span pre-input>` as well as
`<pre-input>`), which had drifted apart between them.
