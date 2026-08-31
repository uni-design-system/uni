---
'@uni-design-system/uni-mcp': patch
---

`get-component` lists inherited inputs, and each story gets its own example.

**`variant` and `size` were missing from almost every component.** 49 components
extend `BaseComponent`, which declares both as real bindable inputs — but the
adapter is a regex over a single file with no `extends` handling, and
`BaseComponent` has no `selector`, so it is discarded before it can be parsed.
The two inputs survived only for the handful of components that redeclare them
locally. An agent reading `get-component toggle` saw no `variant`, which is the
one knob that made a consumer's migration viable. They are now appended to every
`BaseComponent` subclass, deduped so a local `override` still wins.

**Every story of a component shared one example.** `extractTemplate` matched the
first `template:` in a stories file and the result was cached per file, so a
component whose meta declares a generic `render` had all of its examples collapse
into that stub — `uni-toggle` shipped six identical `<uni-toggle></uni-toggle>`
snippets, and its richest story documented as its poorest. Each story's own
template is now located by brace-balancing its object literal, falling back to
the file-level template for the args-only stories that legitimately share the
meta render.

Also raises the theme payload ceiling from 20 KB to 24 KB. That guard exists to
catch the ~50 KB icon set creeping back into the wire form, and ordinary token
growth had reached the old limit; it is sized to catch the icons, not to freeze
the token set.
