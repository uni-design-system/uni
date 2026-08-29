---
'@uni-design-system/uni-angular': patch
---

`uni-angular`'s build now runs `tsc --noEmit` first, closing the last gap left
by the earlier "typecheck the builds" change — core and react already did this,
angular did not.

`ng-packagr` alone does not surface every type error in the package. A real one
reached a Storybook build unnoticed: a form control declaring
`min = input(0)` where `FormValueControl` types the property as
`InputSignal<number | undefined>` (Signal Forms syncs it from `min()`
validators), which is a variance error `pnpm build` reported as success. Every
form control must declare `min`/`max` as `input<number | undefined>(…)` and read
a `resolvedMin()` computed internally.

Also here:

- A `type-check` script, matching core and react, so `turbo type-check` covers
  the whole workspace.
- `prototypes/**` is excluded from the package tsconfig. Those are standalone
  design explorations that reference modules and dependencies which do not
  exist in this package — excluding them is what makes a real typecheck
  possible over the code that ships.
- Three latent type errors fixed: `vitest.config.ts` took `defineConfig` from
  `vite`, whose overload does not accept the `test` block (it comes from
  `vitest/config`); `spacing.spec.ts` lost callback inference through an
  untyped `vi.spyOn` return; and `radio.motion.spec.ts` typed a `motion`
  argument as `Record<string, unknown>` rather than `Motions`.
