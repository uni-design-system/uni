---
'@uni-design-system/uni-angular': major
---

Selector unification: one form per component

**Breaking:** every PascalCase alias selector is removed (`Card`, `Menu`, `Symbol`,
`Icon`, `Dialog`, `Button`, `Tabs`, `Snackbar`, `SelectInput`, `Confirmation`, … — a
concept inherited from another library). Each component now has exactly one canonical
form, chosen by what the component is:

- **Widgets and content-renderers** keep their `uni-*` element: `<uni-card>`,
  `<uni-menu>`, `<uni-symbol>`, `<uni-icon>`, `<uni-tabs>`, `<uni-select>`,
  `<uni-confirmation-dialog>`, …
- **Decorators of native elements** are attribute-only, and their `div`-locks are
  lifted: `[uni-badge]`, `[uni-dialog-header]` (e.g. on `<header>`),
  `[uni-dialog-buttons]`/`[dialog-buttons]` (e.g. on `<footer>`),
  `[uni-scroll-area]`/`[scroll-area]`, `[uni-menu-item]`/`[menu-item]` (e.g. on
  `<li>`).
- **Host-locked selectors stay host-locked** where the native element carries the
  behavior: `dialog[uni-dialog]`, `button[uni-text-button]`/`button[text-button]`,
  `button[uni-icon-button]`/`button[icon-button]`.

Migration is mechanical: `<Card>` → `<uni-card>`, `<Button …>` →
`<button text-button …>`, `<Dialog …>` → `<dialog uni-dialog …>`, `<Badge …>` →
`<div uni-badge …>`, `<ScrollArea …>` → `<div scroll-area …>`. All internal usages,
stories, and docs are migrated; `llms.txt` and the MCP index reflect the canonical
forms.
