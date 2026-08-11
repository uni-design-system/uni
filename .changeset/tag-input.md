---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

New `uni-tag-input`, plus a shared listbox contract in the CDK

The type-to-add chip field — recipients, filters, labels. It is the **open-set**
control: anything typed can become a token, whether or not it matches a
suggestion. Closed-set picking stays with `uni-select` /
`uni-multi-select-dropdown`, which is the deliberate split — the two look alike
but differ on the one thing that decides the value type, so a single component
would force one of them to carry an API it can never use.

- **`FormValueControl<UniTagItem[]>`.** `{ value: 'a@b.com' }` is a complete
  item; `label`, `avatarSrc`, `invalid` and `disabled` are optional enrichment.
- **Invalid entries stay in the value, flagged**, rather than being dropped — a
  field that silently swallows a typo'd address is worse than one that shows it
  in red, and Enter on the chip lifts it back into the input to fix. Duplicates
  and over-`max` entries are refused through `(rejected)` with a reason.
- **Full keyboard contract**: separators commit, Tab commits without trapping,
  Backspace on an empty field *focuses* the last chip rather than deleting it
  blind, and on a chip Backspace and Delete both remove but move focus in
  opposite directions — what makes pruning a list feel right.
- **The whole field is one tab stop.** Chips carry `tabindex="-1"`, so Tab never
  walks through eight recipients to reach the next control.
- **Announces through a `role="status"` live region** on every add, remove and
  rejection; the removal route is described once per field rather than by every
  chip.
- **`preset="email"`** wires an address validator, a paste parser that unwraps
  `Name <a@b.com>` and keeps an unterminated tail in the field, and Space as a
  separator.
- **`'tagInput'` joins core's `ComponentName`** with a theme entry for the chip
  field's own tokens. Field chrome is not duplicated — it comes from `input` via
  `uni-input-box`, so a tag input restyles with every other field.

**Also in this release**

- **`ListboxNavigation` in the CDK** (`createListboxNavigation`) owns the
  combobox bookkeeping every type-ahead control needs: open state, active
  option, wrap-around arithmetic, Home/End, and `aria-activedescendant` wiring
  that can never point at an option a narrowing filter has removed.
  `uni-search-input` now uses it — behaviour unchanged, and it gains Home/End
  for free — and the multi-select combobox upgrade will too. Three hand-rolled
  copies of one keyboard contract is how they drift.
- **`uni-tag` gains `controlTabIndex`**, so a composite that owns its own roving
  focus can take its chips out of the tab order, and **`selected` is now
  optional**: an interactive chip carries `aria-pressed` only when it is
  genuinely a toggle. Announcing "not pressed" on a recipient chip is worse than
  announcing nothing.
