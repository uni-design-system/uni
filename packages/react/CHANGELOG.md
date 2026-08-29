# @uni-design-system/uni-react

## 10.0.0

## 9.0.1

### Patch Changes

- [`f926cd5`](https://github.com/uni-design-system/uni/commit/f926cd513a5cac593adef559e21bada4dada76ee) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-react`'s Switch reads the `success` color token instead of hand-rolling an
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

## 9.0.0

### Major Changes

- [`8250162`](https://github.com/uni-design-system/uni/commit/8250162c35e418f976080904df4c20783feeb6e2) Thanks [@gaenglish](https://github.com/gaenglish)! - Every deprecated API is removed. The library now carries no `@deprecated`
  symbols at all.

  **Per-component duration options → the `motion` scale.** Six components carried
  their own duration knob that predated the motion scale and _won over_ it:
  `expand.transitionSpeed`, `callout.transitionMs`, `radio.transitionSpeed`,
  `menuItem.transitionSpeed`, `alert.transitionSpeed` and
  `snackbar.transitionDelay`. All are gone, along with the precedence branch each
  one required — timing now comes from the token, full stop.

  Retime the token instead; one edit covers every component pointing at it. To
  retime a single component, define a token of your own and point that
  component's `motion` option at it:

  ```ts
  createTheme({
    …,
    motion: { productive: { duration: 110, easing: 'ease' } },
    components: { menuItem: { options: { motion: 'productive' } } },
  });
  ```

  A `duration: 0` token is how a theme opts out of motion — that is what
  `transitionSpeed: 0` used to mean. Both showcase themes are migrated this way
  (Carbon to a 110ms `productive` token, Wellsourced to an `instant` one).

  **Options that never did anything.** `card.transitionSpeed` and
  `inputBox.transitionSpeed` were read by nothing and never had been. Delete them
  from your theme; nothing replaces them.

  **Renames and obsolete APIs**
  - `inputBox.typeFace` → `typeface` (the casing every other component uses).
  - `uni-tooltip`'s `appendToBody` input — inert since the tooltip moved to the
    native top layer, which escapes any overflow context by itself.
  - Box's `elevation` input → `shadow`, in both the Angular and React packages.
    It was a second name for the same thing.
  - The Angular `icons` re-export → import `BaseIcons` from
    `@uni-design-system/uni-core`. The default set ships with every theme.

  **The HSL color legacy is gone from uni-core.** `uniColor`, `randomRangeValue`,
  `CategorySaturation` and `CategoryLightness` are removed, superseded by the
  deterministic OKLCH engine (`generateThemes` / `generatePalette`) — same input,
  same theme, WCAG-checked. `RoleHues` and the `UniColor` type go with them: they
  were reachable only through `uniColor`, and `RoleHues` had gone stale enough to
  hold saturation values in a table of hues.

  **Deferred output renames.** Three outputs were held back because renaming is
  breaking; this is that release. Each also drops an eslint escape it needed for
  shadowing a native event name or using an `on` prefix.

  | Component            | Before            | After            |
  | -------------------- | ----------------- | ---------------- |
  | `uni-debounce-input` | `(change)`        | `(valueChange)`  |
  | `uni-search-input`   | `(change)`        | `(searchChange)` |
  | `uni-search-input`   | `(search)`        | `(searchSubmit)` |
  | `dragAndDrop`        | `(onFileDropped)` | `(fileDropped)`  |

  **`uni-dropdown`'s `color` input → `containerColor`,** completing the rule the
  layout directives set: every container-pair input in the library is now
  `containerColor`, and plain `color` always means the CSS property.

  **`ThemeService.getSpacing('none')` now returns `0`, not the string `'none'`.**
  `'none'` is not a valid length, so it was silently dropped wherever it landed —
  `uni-menu` carried a comment working around exactly that, which is now deleted.

## 8.4.0

### Minor Changes

- [`82d1341`](https://github.com/uni-design-system/uni/commit/82d134169997abc2a0f6261e248548e5b3240dcb) Thanks [@gaenglish](https://github.com/gaenglish)! - React layout primitives, at parity with Angular: `Box`, `Stack`, `Row`, `Center`, `Wrap`, `Grid` and `GridArea`. Angular applies layout as an attribute so the element's semantics stay the author's (`<main box-layout>`); React's equivalent is the polymorphic `as` prop — `<Box as="main" padding="md">` — with refs and DOM props forwarded to whatever element it renders.

  Props, defaults and resolution order are ported one-for-one from `UniBoxComponent`, so the same tokens produce the same CSS in both frameworks: token-driven color pairs, padding, radius, border, shadow, gap and z-index; a number is px and a string is a CSS length for every sizing prop; `dashBorder` draws the SVG dashed outline; `ignoreDir` (default on) still flips flex direction under `dir="rtl"`. `Stack` keeps its `minHeight: fit-content` guard and `Row` its `minWidth: fit-content` — set `minHeight={0}` / `minWidth={0}` to shrink inside a constrained flex parent.

  Supporting this: `createThemeStyles`/`useThemeStyles` — the React port of the Angular `ThemeService` token → CSS resolvers, method-for-method — and `@emotion/css` (new peer dependency, matching the Angular package) so pseudo-selectors like `:dir(rtl)` resolve in a real class rather than an inline style. A Box that paints a container color now also provides that token to its descendants, so `Text` inside it picks up the matching on-color.

## 8.3.1

## 8.3.0

## 8.2.0

### Patch Changes

- [`e706e38`](https://github.com/uni-design-system/uni/commit/e706e3887f47d8821cc1652410ad37a43d52a428) Thanks [@gaenglish](https://github.com/gaenglish)! - Ship `CHANGELOG.md` in the published packages. The release notes existed only in the repo; an installed package carried no record of what changed, so upgrade questions couldn't be answered from `node_modules`. uni-angular copies it into the ng-packagr `dist` via `assets`; the rest add it to `files`.

## 8.1.0

## 8.0.0

## 7.3.0

## 7.2.0

## 7.1.0

## 7.0.0

## 6.1.0

## 6.0.1

## 6.0.0

## 5.2.0

## 5.1.0

## 5.0.0

### Patch Changes

- Updated dependencies [[`f7f0bdd`](https://github.com/uni-design-system/uni/commit/f7f0bdddfac855955e022a852c2bfdccf8013a7b)]:
  - @uni-design-system/uni-core@5.0.0

## 4.0.0

### Patch Changes

- Updated dependencies [[`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9)]:
  - @uni-design-system/uni-core@4.0.0

## 3.0.2

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.2

## 3.0.1

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.1

## 3.0.0

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.0

## 2.0.4

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.3

## 2.0.2

### Patch Changes

- [`c5c552a`](https://github.com/uni-design-system/uni/commit/c5c552a74a7ee48e64c438db30e6dd2514ac9b11) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix: switch React package distribution to bundled multi-format outputs via Vite to resolve strict ESM runtime and source compilation issues inside consumers.

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.2

## 2.0.1

### Patch Changes

- [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4) Thanks [@gaenglish](https://github.com/gaenglish)! - Setting Fixed Versioning for all packages.

- Updated dependencies [[`e2cad74`](https://github.com/uni-design-system/uni/commit/e2cad74631b3a9d2caf4816bcadedf19db99fec4), [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4)]:
  - @uni-design-system/uni-core@2.0.1

## 2.0.0

### Minor Changes

- [`4a049de`](https://github.com/uni-design-system/uni/commit/4a049def689d56d6b6cc1d2da73c9facd93ed515) Thanks [@gaenglish](https://github.com/gaenglish)! - Adding cjs support

### Patch Changes

- Updated dependencies [[`4a049de`](https://github.com/uni-design-system/uni/commit/4a049def689d56d6b6cc1d2da73c9facd93ed515)]:
  - @uni-design-system/uni-core@1.1.0

## 1.0.0

### Major Changes

- [`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756) Thanks [@gaenglish](https://github.com/gaenglish)! - init release

### Patch Changes

- Updated dependencies [[`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756)]:
  - @uni-design-system/uni-core@1.0.0
