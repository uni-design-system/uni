---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': patch
---

Menu items no longer look preselected when opened with the mouse

Opening a `uni-menu` by click left the first item highlighted before the
pointer had touched it, reading as a preselected default. Two correct
behaviours combined badly: `onOpened()` implements ARIA roving focus by calling
`.focus()` on an item every open, and the item styles deliberately painted
`:focus` the same as `:hover`. Nothing was wrong with the focus itself — only
with painting it after a pointer open.

- **The highlight now keys on `:focus-visible`.** Programmatic focus following a
  click doesn't match it, while keyboard-driven focus does — so mouse users get
  no phantom highlight, and keyboard users keep the focus cursor. Roving-focus
  bookkeeping is untouched: a mouse open still moves focus to the first item, so
  screen readers announce it exactly as before.
- **New `HOVER_OR_KEYBOARD_FOCUS` constant exported from uni-core**, holding
  that selector. Emotion merges styles by *exact selector text*, so a component's
  base rule and any theme variant restyling it have to agree character for
  character — a variant keyed `'&:hover, &:focus'` would both fail to override
  and reintroduce the phantom highlight. Naming the selector once removes the
  trap; the base theme's `menuItem.warn` tone and the Carbon/Wellsourced
  showcase themes now use it.

Themes with their own `menuItem` variants should key the highlight with
`HOVER_OR_KEYBOARD_FOCUS`. Note that `:focus-visible` is a browser heuristic:
after a user has been navigating by keyboard, a subsequent click may still show
the highlight, which is the intended "this person is using the keyboard"
behaviour rather than a regression.
