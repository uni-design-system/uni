---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

New `uni-drawer` and `uni-app-bar` — the dashboard shell

- **`uni-drawer`** has two modes sharing one content slot: `side` renders an in-flow
  `<aside>` that pushes content (width-animated open/close, divider border primitive at
  its edge, `aria-hidden` while closed); `over` renders a native `<dialog>` in the top
  layer — focus trap, Escape, and scrim backdrop come from the platform, sliding in
  from `position` (`start`/`end`). `open` is a two-way `model()`; Escape and backdrop
  clicks keep it in sync. Tokens: `drawer.options` (`color`, `width`, `divider`,
  `elevation`, `padding`, `backdrop`).
- **`uni-app-bar`**: leading/trailing content projection slots around a `title` (or
  custom center content), trailing pushed to the far edge; optional `sticky`. Tokens:
  `appBar.options` (`color`, `height`, `divider`, `typeface`, `padding`, `gap`,
  optional `elevation`).
- The Drawer "DashboardShell" story documents the composition recipe: app bar with a
  menu toggle + side drawer + content.
