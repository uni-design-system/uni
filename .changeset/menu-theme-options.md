---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Menus join the theme model: `menu` + `menuItem` component options, item tones, and dividers

The menu was the only composite component with no theme surface of its own —
panel chrome came from the shared `dropdown` entry and every item-level knob
(height 38, `primary-container` hover, `check` active symbol, `label` type
role) was hardcoded. Every Uni menu therefore looked identical, and the gaps a
real product hits first (a red Delete, a separator before it, disabled rows)
were only reachable via `::ng-deep`.

- **New `menu` theme options** (`'menu'` joins core's `ComponentName` union):
  `minWidth`, panel `color`/`border`/`borderRadius`/`shadow` (each falling
  back to the `dropdown` options when unset, so menus follow generic popovers
  until a theme deliberately splits them), `paddingVertical`/
  `paddingHorizontal` (panel inset — `xs` inset plus item `borderRadius`
  yields the "hover pill" look; `none` yields full-bleed rows), and
  `dividerBorder`/`dividerSpacing` for separators.
- **New `menuItem` theme options + variants** (`'menuItem'` joins
  `ComponentName`): `height`, `paddingHorizontal`, `gap`, `borderRadius`,
  `typeface`, `textColor`, `hoverColor`, `activeSymbol` (undefined removes the
  trailing check), and `transitionSpeed`. Theme `variants` on `menuItem` carry
  tones — the base theme ships a `warn` tone for destructive actions.
- **`MenuItem` grows `variant`, `disabled`, and `{ divider: true }`.**
  `variant: 'warn'` routes through the theme's `menuItem` variants; `disabled`
  items render in the disabled color, carry `aria-disabled`, and are skipped
  by keyboard navigation; dividers render as `role="separator"` rules styled
  by the `menu` options. `isDivider` and the `UniMenuOptions`/
  `UniMenuItemOptions` interfaces are exported from uni-angular.
- **`uni-dropdown` panel chrome is now input-overridable**
  (`border`/`borderRadius`/`shadow`/`color`), falling back to the `dropdown`
  theme options — this is the mechanism `uni-menu` uses; other consumers are
  unchanged.
- **Default-rendering change:** menus now have `minWidth: 184` from the base
  theme (previously they sized to the widest item). All other defaults
  reproduce the previous look, including the 0.35s hover transition.
- **The Carbon experiment themes gain menu styling** (sharp full-bleed 40px
  rows, IBM Plex, `$layer-hover`, red danger option, ~110ms motion) with a new
  Carbon Menu story demonstrating that the same component renders both
  aesthetics untouched.
