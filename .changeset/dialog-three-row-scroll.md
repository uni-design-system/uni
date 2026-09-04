---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

Give `uni-dialog` the drawer's three-row layout: a pinned `[uni-dialog-header]`, a scrolling body, and pinned `[uni-dialog-buttons]`.

The surface is now a flex column that is `overflow: clip` on both axes, so it is never the scroll container — previously a long form scrolled the dialog's own title and action buttons off the screen. Unlike the drawer, the dialog declares no height and stays sized by its content, growing until it reaches `calc(100dvh - 2 × inset)` and only then scrolling its body.

New theme options: `dialog.inset` (gap from the viewport edge before the body scrolls, default `lg`), `dialog.bodyPadding` (pads the scrolling row alone; `dialog.padding` still insets all three rows), and `divider` on `dialogHeader` / `dialogButtons` for a border between a pinned row and the body — all off or unchanged by default, so existing dialogs keep their appearance.

`[uni-dialog-header]` gains the shorter `[dialog-header]` alias, matching `[dialog-buttons]`; the long form keeps working. The `defaultCloseButton` now actually floats in the corner — its `position: absolute` was being lost to the icon button's own class, which left it inline at the top of the surface.
