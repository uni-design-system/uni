---
'@uni-design-system/uni-angular': major
'@uni-design-system/uni-core': major
'@uni-design-system/uni-react': major
'@uni-design-system/uni-mcp': major
---

Require Angular 22. `@angular/common`, `@angular/core` and `@angular/forms` move from `^21.2.0` to `^22.0.0`, so 11.x tracks Angular 22 and 10.x remains the Angular 21 line — one major of this package per Angular major, as documented. The old range excluded v22 outright, so an app that had taken Angular 22 could not install this package without a peer override.

Two consequences of the framework's own changes:

**`touch` output on every form control.** Angular 22 marks a bound field touched through a dedicated `touch` output rather than through the `touched` model, which the `Field` directive now binds inward only. All sixteen controls that track touched state (input, textarea, checkbox, radio, toggle, select, combobox, multi-select, tag-input, calendar, date/date-time/time inputs, number/number-range inputs, quantity-stepper, slider) emit it wherever they already considered the user done with the control. Without it, `touched()` never flips and error display gated on it never appears.

**`min` / `max` typing.** The contract now types `min`/`max` as the control's own value type rather than as numbers. Where that still fits, the input was widened (`uni-slider`). Where it does not — a text control's native numeric attributes (`uni-input`), a range control's scalar bounds (`uni-number-range-input`), a tag limit (`uni-tag-input`) — the class member steps aside and the public binding name is preserved by an alias, so **templates are unchanged**. Only code reaching these through a `ViewChild` instance is affected: `min`/`max` are now `minAttr`/`maxAttr` on `uni-input`, `minValue`/`maxValue` on `uni-number-range-input`, and `max` is `maxLength` on `uni-tag-input`. `uni-number-range-input`'s protected `valueOf()` is renamed `partValue()`, since `valueOf` collides with `Object.valueOf`.

Angular 22 also makes `OnPush` the default change detection; every component here already set it explicitly.
