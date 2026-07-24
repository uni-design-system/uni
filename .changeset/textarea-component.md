---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

New `uni-textarea` component

- Multi-line text field with the same Signal Forms contract as `uni-input`
  (`FormValueControl<string>`: `value` model, `disabled`/`invalid`/`dirty`/`required`,
  touched-aware error styling, `aria-*` wiring).
- Reuses `uni-input-box` for its chrome, so it inherits the input's themed color,
  border, typeface, focus outline, and disabled treatment automatically; the box's
  field selectors now cover `textarea` (with auto height and vertical padding), and
  the box accepts a `height` override.
- Theme options follow the token pattern: `textarea: { options: { rows: 3, resize:
  'vertical' } }` in the derived component themes; the `rows` input overrides per
  instance.
