---
'@uni-design-system/uni-angular': minor
'@uni-design-system/uni-core': minor
---

Give `uni-dialog` the drawer's three-row layout: a pinned `[uni-dialog-header]`, a scrolling body, and pinned `[uni-dialog-buttons]`.

The surface is now a flex column that is `overflow: clip` on both axes, so it is never the scroll container — previously a long form scrolled the dialog's own title and action buttons off the screen. Unlike the drawer, the dialog declares no height and stays sized by its content, growing until it reaches `calc(100dvh - 2 × inset)` and only then scrolling its body.

New theme options: `dialog.inset` (gap from the viewport edge before the body scrolls, default `lg`), `dialog.bodyPadding` (pads the scrolling row alone; `dialog.padding` still insets all three rows), and `divider` on `dialogHeader` / `dialogButtons` for a border between a pinned row and the body — all off or unchanged by default, so existing dialogs keep their appearance.

`[uni-dialog-header]` gains the shorter `[dialog-header]` alias, matching `[dialog-buttons]`; the long form keeps working. The `defaultCloseButton` now actually floats in the corner — its `position: absolute` was being lost to the icon button's own class, which left it inline at the top of the surface.

The drawer's overlay scrim now fades in and out with the panel instead of snapping. Its `::backdrop` had a background and no animation at all, so the dimming appeared and vanished instantly around a panel that took 250ms to slide. A new `drawer.motion` option (default `panel`) times the slide, the scrim's fade and the side panel's width transition together, replacing the hardcoded 250ms literals. The global reduced-motion rule now also reaches `::backdrop`, so both the drawer's and the dialog's scrim honour the preference (WCAG 2.3.3).

Dialog and drawer scrims now come from one token. `UniTheme` gains a `backdrops` scale — open and named like `shadows` and `motion` — and both components' `backdrop` option points at a name (`'scrim'`) instead of carrying its own CSS. They had drifted: the dialog washed the page white and blurred it while the drawer dimmed it dark, and a theme that dressed the dialog left the drawer on the library default. A raw style object is still accepted on either option, so a theme that states one keeps working.

The dialog's fade now reads the theme's `motion` token too (new `dialog.motion` option, default `panel`), replacing a hardcoded `350ms ease-in`. It shared the drawer's scrim but not its timing, so the same surface arrived at two speeds; both are now 250ms and a theme retimes them together.
