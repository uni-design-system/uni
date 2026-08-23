---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

The spacing scale is open, and `createTheme` finally accepts one.

The scale was a closed seven-name union on a doubling curve (2/4/8/16/32/64px).
Real layouts are rarely built exclusively on one — the gaps between 8 and 16,
and 16 and 32, are where a lot of real spacing lives — and there was no way to
add a step, because **`ThemeConfig` had no `spacing` field at all**:
`createTheme` hardcoded the base scale. The Wellsourced showcase theme had to
bolt its scale on after the fact with a post-hoc spread.

Three changes, which only work together:

- `NullableSize` gains a `(string & {})` arm, so any name the theme defines is a
  valid `padding` / `gap` / `marginInline` value while the seven named steps keep
  their autocomplete. `Size` itself stays closed — it also types *component*
  sizes, where an arbitrary name has nothing to resolve against.
- `Spacing` is spelled out as named-optional-keys plus an index signature
  (mirroring `Typography`), rather than a `Partial<Record<…>>` that would
  collapse to a plain string record and lose the named steps.
- `createTheme({ spacing })` merges over the base scale.

```ts
createTheme({ id, name, colors, spacing: { tight: '6px', snug: '10px' } });
```
```html
<div stack-layout padding="tight" gap="snug">…</div>
```

Because the scale is open, a mistyped token can no longer be a compile error. It
is dropped — an `undefined` CSS value simply does not render — and
`ThemeService` now warns once per unknown token in development, naming the
tokens the active theme does define. Scaffolded `uni-theme.ts` files carry a
`spacing` block so the static theme file stays the editable source of truth.

**Behavior change:** `xxl` was in the `Size` union but defined by no base theme,
so `padding="xxl"` type-checked and rendered nothing. It is now `128px`,
completing the doubling — any element relying on the silent drop will start
showing spacing.
