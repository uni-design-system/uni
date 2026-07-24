---
'@uni-design-system/uni-mcp': patch
---

Fix published index losing its Storybook examples, and keep the index in sync

- `uni-mcp@4.1.x` shipped with **0 examples**: the package build regenerated the index in
  CI, where `storybook-static` (gitignored) doesn't exist, silently overwriting the
  committed 107-example index before bundling. `build` is now `tsup` only — the committed
  `uni-index.json` is the single source of truth and is bundled as-is.
- The index is regenerated once per release instead: the changesets `version` step
  (`pnpm version-packages`) builds Storybook and reruns `build-index` after the version
  bump, so the refreshed index lands reviewably in the Version Packages PR.
- `build-index` now fails loudly when it finds zero examples, so an example-less index
  can never ship silently again.
- Index refreshed to v5.1.0: includes the new component option tokens
  (`button.behavior.borderRadius`/`typeface`, `card.behavior.borderRadius`), the nine
  Theme Builder presets' generation updates, and all 107 examples.
