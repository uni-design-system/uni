---
'@uni-design-system/uni-angular': major
'@uni-design-system/uni-core': major
---

Composite components now render their glyphs through `uni-icon` theme tokens instead of `uni-symbol` ligatures, completing the rule set in `AGENTS.md`. Thirteen theme options are renamed and retyped from `string` to `IconName`:

| Component | before | after |
| --- | --- | --- |
| date-input, time-input | `toggleSymbol` | `toggleIcon` (`calendar`, `clock`) |
| calendar | `navPrevSymbol` / `navNextSymbol` | `navPrevIcon` / `navNextIcon` |
| menu-item | `activeSymbol` | `activeIcon` |
| avatar | `fallbackSymbol` | `fallbackIcon` (`person` → `profile`) |
| breadcrumb | `separatorSymbol` | `separatorIcon` |
| search-input | `searchSymbol` / `clearSymbol` | `searchIcon` / `clearIcon` |
| callout, popover | `closeSymbol` | `closeIcon` |

`drawer-header` and `dialog-header` shipped both `closeButtonIcon` and `closeButtonSymbol`; the `*Symbol` half is removed, and since `symbolName` outranked `iconName` inside the icon button, those two headers were still rendering the ligature path until now.

Four glyphs join `BaseIcons` (65 total): `arrowUp`/`arrowDown` and `chevronsLeft`/`chevronsRight`, which is what unblocked `uni-sort-header` and `uni-paginator`. `select-input`, `multi-select-dropdown` and `data-search` also stopped hardcoding ligatures.

**Migrating:** rename the option in your theme and swap the Material ligature for an icon token — `activeSymbol: 'check'` becomes `activeIcon: 'check'`, `toggleSymbol: 'calendar_month'` becomes `toggleIcon: 'calendar'`. Any glyph you need that `BaseIcons` lacks can be registered through `createTheme({ icons })`.

`uni-symbol` is unchanged and still the right tool for app-facing inputs that take arbitrary ligature names — `symbolName` on icon-button, tag, alert, snackbar and menu-item, and `symbolLeft`/`symbolRight` on button. One consequence worth knowing: `uni-icon` has no variable-font axes, so a theme setting `symbol: { options: { weight } }` no longer affects these composites' glyphs — they take the icon set's weight (300). The Wellsourced theme, which sets weight 200, has accepted this.
