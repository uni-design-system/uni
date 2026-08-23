---
'@uni-design-system/uni-react': patch
'@uni-design-system/uni-core': patch
---

`uni-react`'s Switch reads the `success` color token instead of hand-rolling an
HSL string from a color-generation internal, and both packages now typecheck as
part of their build.

The Switch built its "on" color as `hsl(${RoleHues.success.default}, 32%, 50%)`
— a fixed green assembled from the HSL generation tables rather than the theme,
so it never recolored with the theme and broke when those tables were removed.
It now reads `useTheme().colors.success`.

The reason that reached a deploy is the build. `vite build` transpiles with
esbuild, which strips types without checking them, and it treats
`@uni-design-system/uni-core` as an external — so neither the type layer nor the
module graph ever verified that an imported core export exists. `pnpm turbo run
build` passed on a package whose source did not compile.

- `core` and `react` now run `tsc --noEmit` as the first half of `build`, so a
  removed or renamed core export fails the consumer's build.
- A `type-check` turbo task exists for running that pass alone.
- CI builds **both** Storybooks, not just Angular's. These bundle uni-core
  instead of externalizing it, so they are the step that resolves its exports
  against real consumer source.

This also cleared four pre-existing type errors in `IconTextRow`, which did
arithmetic on `fontSize` / `lineHeight` — typed `CssLength` (`number | string`)
— and passed the result to props typed `number`. They are coerced through one
documented helper now.
