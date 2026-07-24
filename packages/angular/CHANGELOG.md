# @uni-design-system/uni-angular

## 6.0.0

### Major Changes

- [`a02afee`](https://github.com/uni-design-system/uni/commit/a02afee3c1c4721ff626445684f41de432443731) Thanks [@gaenglish](https://github.com/gaenglish)! - Layout components are attribute-only, on any element

  **Breaking:** the shorthand element selectors `Box`, `Stack`, `Row`, `Grid`, `Wrap`,
  and `GridArea` are removed — a concept inherited from another library that conflicted
  with semantic HTML. Migrate to the attribute form: `<Box padding="md">` →
  `<div box-layout padding="md">` (GridArea → `grid-area-layout`).

  In exchange, the attribute selectors now apply to **any element**, not just `div` —
  layout and semantics compose: `<main box-layout [grow]="1" padding="md">`,
  `<nav stack-layout gap="sm">`, `<section stack-layout>`.

  Also documented, unchanged in behavior: the sizing convention (number = px via
  binding, `[height]="420"`; plain attribute = CSS length, `height="420px"`) and
  Stack/Row's `fit-content` min-size defaults (set `[minHeight]="0"` / `[minWidth]="0"`
  for scroll containment). All internal usages, stories, and docs are migrated —
  including the Divider story's `<Center>`, which had silently never rendered (Center
  never had an element selector).

- [`f1796fb`](https://github.com/uni-design-system/uni/commit/f1796fbb42015dafb3a122f6effe69bc2b07d525) Thanks [@gaenglish](https://github.com/gaenglish)! - Selector unification: one form per component

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

- [`a62e9b1`](https://github.com/uni-design-system/uni/commit/a62e9b116f0b57cf2a1e647155bc2fbc02b02b87) Thanks [@gaenglish](https://github.com/gaenglish)! - Text is attribute-only, with a value shorthand and element-aware defaults

  **Breaking:** the `uni-text` and `Text` element selectors are removed. Text is now the
  attribute `[uni-text]` on any element, keeping your HTML semantics:
  - **Value shorthand** — the attribute value is the typeface:
    `<h1 uni-text="display-small">`, `<span uni-text="caption">`, dynamic via
    `[uni-text]="role()"`. The explicit `typeface` input still works (the attribute
    value wins when both are set).
  - **Element-aware defaults** — with no value, the typeface is inferred from the host:
    `h1`→headline-large, `h2`→headline-medium, `h3`→headline-small, `h4`→title-large,
    `p`→body-1-long, `small`/`figcaption`→caption, `blockquote`→quote, `label`→label,
    else title-small. Plain semantic markup is correctly set with zero configuration.

  Migrate `<uni-text typeface="body-1-long">…</uni-text>` →
  `<p uni-text>…</p>` (or `<span uni-text="body-1-long">` where no semantic element
  fits). All internal usages, stories, and docs are migrated.

### Minor Changes

- [`5a6fc60`](https://github.com/uni-design-system/uni/commit/5a6fc601952e0cbda80810a1c9062588c675d89f) Thanks [@gaenglish](https://github.com/gaenglish)! - Search input stripped back and made generic; debounce input dressed in the shared chrome
  - **`uni-debounce-input`** now wears the themed input chrome via `uni-input-box`
    (color, border, typeface, focus ring) and gains `label` (accessible name),
    `placeholder`, `disabled`, `pre-input`/`post-input` attribute slots for adornments,
    ARIA passthroughs (`role`, `ariaExpanded`, `ariaControls`, `ariaActivedescendant`)
    for composite widgets, and `clear()`/`focus()` methods. Debounce behavior unchanged.
  - **`uni-search-input` redesigned**: the opinionated solid-primary pill bar with the
    embedded `title-large` label is gone. It's now a standard themed field — decorative
    leading magnifier, clear button while a query exists (refocusing on clear), Enter
    emits `search`, Escape closes/clears.
  - **Type-ahead added**: pass `suggestions` (refresh from `change`) and the field
    becomes an ARIA combobox — keyboard-navigable listbox (ArrowUp/Down, Enter selects,
    emitting `suggestionSelected` + `search`), `aria-activedescendant` wiring, focus-out
    closing. New `searchInput` theme options: `searchSymbol`, `clearSymbol`, suggestion
    list `listColor`/`listShadow`/`listBorderRadius`, `maxSuggestions`.
  - Visual breaking change for SearchInput consumers (deliberate strip-back); code API
    is compatible (`label`/`width`/`change`/`search` retained; `label` is now the
    accessible name + placeholder fallback rather than displayed text).

- [`8953d59`](https://github.com/uni-design-system/uni/commit/8953d59aa5f5eed57801534c7cbf5ff05453c316) Thanks [@gaenglish](https://github.com/gaenglish)! - Checkbox, radio, and toggle conform to theme tokens
  - The last hardcoded control colors (`#FFF`, `#ccc`, `#d0d0d0`, `#e0e0e0`,
    `rgba(0,0,0,0.2)`) are gone. Chrome now resolves from new option tokens —
    checkbox `boxColor: 'surface'`; radio `ringColor: 'outline'` / `fillColor:
'surface'` (radio gains a theme entry for the first time); toggle `trackColor:
'surface-variant'` / `knobColor: 'surface'` — so all three finally render
    correctly on dark and brand themes.
  - The checkbox's check/dash strokes wear the variant's paired on-color
    (`on-primary`, `on-warn`, …) instead of assuming white; disabled states use the
    `disabled`/`on-disabled` tokens; the toggle knob's shadow is the theme's
    brand-tinted `raised` stack, and its hover uses the button convention's
    brightness filter instead of a fixed grey.

- [`7a6da4f`](https://github.com/uni-design-system/uni/commit/7a6da4f60979795f10e85493d1d13543f6a5a0e1) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-stat` KPI tile
  - Muted label + large headline value (numbers auto-compact via
    `Intl.NumberFormat`: `48234` → "48.2K") set in a new `stat` type-scale role
    (32px semibold, proportional figures).
  - Optional signed `delta` whose ink is decided by direction × `upIsGood` — churn
    going down reads green, tickets going up reads red — with the arrow glyph
    accompanied by screen-reader "up"/"down" text so state never rides color alone;
    `caption` names the comparison period.
  - Optional decorative 12-point sparkline (`trend` input): stroke in the outline hue,
    endpoint dotted in the accent, `aria-hidden`.
  - Fully token-driven via `stat.options`: card-recipe frame (`color`/`border`/
    `borderRadius`), `labelTypeface`/`valueTypeface`, `positiveColor`/`negativeColor`
    (the semantic inks, AA-guaranteed on surface), `trendColor`/`trendAccent`, spacing.

- [`fea0b2e`](https://github.com/uni-design-system/uni/commit/fea0b2e78da327f3acea144958af2d0dbbefb699) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix invisible icons; icons become first-class theme primitives
  - **Bug**: `uni-icon` resolves icons from `theme.icons`, but every theme shipped
    `icons: {}` — the icon record was never wired in, so all icons (dialog close, button
    spinner, search/clear affordances) rendered nothing.
  - **Fix + pattern**: the default icon set now lives in core (`BaseIcons`, in
    `concepts/iconography`) and `createTheme` merges a theme's `icons` over it — themes
    can override or add icons under any name (inline SVG data URIs, masked with
    `currentColor` so they recolor with the theme). The angular `icons` record re-exports
    `BaseIcons` (deprecated).
  - `uni-icon` also sets the standard `mask-image` (was webkit-only, so icons were
    invisible in Firefox regardless) and renders nothing for unknown names instead of a
    broken `url("undefined")`.
  - The emitted `uni-theme.ts` gains an editable `icons` section, and the MCP's
    `generate-uni-theme` guidance instructs agents: never inline SVG in components —
    define an icon once in the theme's `icons` map and render it via `<uni-icon>`.

### Patch Changes

- Updated dependencies [[`5a6fc60`](https://github.com/uni-design-system/uni/commit/5a6fc601952e0cbda80810a1c9062588c675d89f), [`8953d59`](https://github.com/uni-design-system/uni/commit/8953d59aa5f5eed57801534c7cbf5ff05453c316), [`7a6da4f`](https://github.com/uni-design-system/uni/commit/7a6da4f60979795f10e85493d1d13543f6a5a0e1), [`fea0b2e`](https://github.com/uni-design-system/uni/commit/fea0b2e78da327f3acea144958af2d0dbbefb699)]:
  - @uni-design-system/uni-core@6.0.0

## 5.2.0

### Minor Changes

- [`1f5ee1d`](https://github.com/uni-design-system/uni/commit/1f5ee1dce290aceceec628677fdc9e36b5c5031f) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-avatar` and `uni-avatar-group` components
  - Graceful fallback chain: image → initials derived from `name` (first + last) →
    themed symbol. Accessible by default: `role="img"` + `aria-label` from the name,
    `aria-hidden` when purely decorative.
  - Fully token-driven: variants color from the role's `*-container` tokens, sizes from
    the theme's `avatar` size records, corner radius from `options.borderRadius`
    (`max` = circles; a `sharp` theme gets square avatars), initials typeface from
    `options.typeface`, fallback symbol from `options.fallbackSymbol`.
  - `uni-avatar-group` stacks avatars with a token-driven overlap (spacing token) and
    separator ring (`ringColor`/`ringWidth` options); `max` collapses the overflow into
    a themed "+N" chip that is itself a `uni-avatar` (verbatim `text` input).

- [`dca84b1`](https://github.com/uni-design-system/uni/commit/dca84b1f5a49d56608bac098c26b0e90992ed49d) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-breadcrumb` component
  - WAI-ARIA breadcrumb: labelled `nav` landmark wrapping an ordered list, the last item
    marked `aria-current="page"`, separators decorative (`aria-hidden`).
  - Data-driven `items` (root first). Items with `href` render as real anchors; without
    one they render as link-styled buttons emitting `itemClicked` for SPA routing.
  - Token-driven via `breadcrumb.options`: `typeface`, link `color`, `currentColor`,
    `separatorSymbol` (material symbol), and `gap` spacing.

- [`7844dde`](https://github.com/uni-design-system/uni/commit/7844ddec88f40027dafcaed5192f88d3c0cec54f) Thanks [@gaenglish](https://github.com/gaenglish)! - Button corner rounding and typography conform to component-options tokens
  - `button` and `iconButton` themes gain `options: { borderRadius: 'max' }`; the hardcoded
    per-size pixel radii (11/13/18/24) and the icon button's inline `borderRadius: 999` are
    removed. Components resolve the token through `theme.radius()`, so the theme's radii
    scale — shape languages (`sharp` → square, `playful` → pill) and custom radii
    primitives — now restyles buttons like every other tokened component.
  - Back-compat: the options radius is applied before theme `sizes`/`fixed` styles, so
    hand-authored themes that still set a size-level `borderRadius` keep winning; icon
    buttons fall back to the legacy circle when a theme predates iconButton options.
  - `button` themes also gain `options: { typeface: 'button' }`: the hardcoded
    `fontFamily: 'Euphemia'` (a font no theme loads) is removed from `fixed` and the sizes;
    labels now render the type scale's `button` role (Red Hat Display, medium, capitalize),
    with per-size `fontSize` still applied by `sizes`. Point the token at any typography
    role — including custom ones — to restyle every button label.
  - New `UniButtonOptions` interface (`borderRadius`, `typeface`) exported from the button
    model.

- [`7844dde`](https://github.com/uni-design-system/uni/commit/7844ddec88f40027dafcaed5192f88d3c0cec54f) Thanks [@gaenglish](https://github.com/gaenglish)! - Card frame conforms to token primitives
  - The card theme's hardcoded frame (`borderStyle`/`borderWidth`/`borderRadius: '8px'` in
    `fixed`, `borderColor` per variant) is replaced by tokens: the card resolves its border
    from the **border primitive named by its variant** (`borders.primary` …
    `borders.success`), its corner radius from the radii scale (`options.borderRadius:
'xs'` — same 8px by default), and an optional `options.elevation` shadow token.
  - `UniCardOptions` gains `border` (pin every card to one primitive — including a custom
    one — instead of variant-following) and documents the existing `borderRadius`/
    `elevation`; redefining a border primitive in a theme now restyles cards and every
    other component sharing that token.
  - Token styles apply under the merged theme style, so hand-authored themes that still
    set card `fixed`/`variants` frame styles keep winning. No visual change for default
    themes — this is pure tokenization.

- [`17cf662`](https://github.com/uni-design-system/uni/commit/17cf6621dd78e4af0c8af3575f6a5d103d9fca53) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-drawer` and `uni-app-bar` — the dashboard shell
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

- [`7844dde`](https://github.com/uni-design-system/uni/commit/7844ddec88f40027dafcaed5192f88d3c0cec54f) Thanks [@gaenglish](https://github.com/gaenglish)! - Progress gauge derives from the palette instead of hardcoded pastels

  The gauge's track colors were fixed pastel hexes (`#b3d4ea`, `#b3e7c2`, …) that ignored
  the active theme entirely — secondary and success even shared the same green. Tracks now
  use the role's `*-container` token (the palette's soft tint of that role) and arcs the
  role base, so gauges follow any brand palette, in both light and dark modes.

- [`4ccf18b`](https://github.com/uni-design-system/uni/commit/4ccf18ba86dc81c344597c7bc3e46f5d92f3c232) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-skeleton` loading placeholder
  - Three shapes: `text` (multi-line, ending on a short line like real copy), `rect`,
    and `circle`; explicit `width`/`height` accept CSS strings or px numbers.
  - Painted with surface tokens (`skeleton.options`: `color`, `highlightColor`,
    `borderRadius`, `gap`) so placeholders sit naturally on light and dark themes; the
    shimmer sweep (`animation`/`duration` options) only runs when the user allows motion
    and degrades to static blocks under `prefers-reduced-motion`.
  - `aria-hidden` — placeholders are invisible to assistive tech by design.

- [`5d9062a`](https://github.com/uni-design-system/uni/commit/5d9062ac36f782f2ebbc7012367121b0b86baf9c) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-slider` component — clears the declared-but-unbuilt `ComponentName` entry
  - Native `<input type="range">` under the hood: platform keyboard interaction
    (arrows, Home/End, Page Up/Down) and ARIA slider semantics for free; Signal Forms
    contract (`FormValueControl<number>`) matching Input/Textarea.
  - `min`/`max`/`step` inputs (fractional steps supported), required accessible `label`.
  - Token-driven via `slider.options`: fill/thumb `color`, `trackColor`, `borderRadius`,
    and geometry (`trackHeight`, `thumbSize`). The fill level rides a CSS custom
    property, so dragging never regenerates Emotion styles; Firefox uses the native
    `::-moz-range-progress`, WebKit a gradient stop.

- [`15a8f73`](https://github.com/uni-design-system/uni/commit/15a8f731f70bcd84211b7ff16b9272a2c6f2adc8) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-tabs` / `uni-tab` components
  - Full WAI-ARIA tabs pattern: `tablist`/`tab`/`tabpanel` roles with wired
    `aria-selected`/`aria-controls`/`aria-labelledby`, roving tabindex, automatic
    activation on ArrowLeft/ArrowRight (wrapping, disabled tabs skipped), Home/End,
    and motion-safe transitions.
  - `selectedIndex` is a two-way `model()`; selection snaps to the nearest enabled tab.
    Panel content is captured per-tab and only the selected panel is instantiated.
  - Every visual knob is a theme option token (`tabs.options`): `typeface`, `textColor`,
    `activeTextColor`, `indicatorColor`, `indicatorThickness` (thickness token),
    `divider` (border primitive), `gap`/`padding` (spacing tokens), `borderRadius`, and
    optional `activeColor` — the defaults render underline tabs; `borderRadius: 'max'` +
    `activeColor` turns them into segmented pills with no component changes.

- [`b04b97b`](https://github.com/uni-design-system/uni/commit/b04b97bd109e36cbb8fcda31c73680d85509ab0a) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-textarea` component
  - Multi-line text field with the same Signal Forms contract as `uni-input`
    (`FormValueControl<string>`: `value` model, `disabled`/`invalid`/`dirty`/`required`,
    touched-aware error styling, `aria-*` wiring).
  - Reuses `uni-input-box` for its chrome, so it inherits the input's themed color,
    border, typeface, focus outline, and disabled treatment automatically; the box's
    field selectors now cover `textarea` (with auto height and vertical padding), and
    the box accepts a `height` override.
  - Theme options follow the token pattern: `textarea: { options: { rows: 3, resize:
'vertical' } }` in the derived component themes; the `rows` input overrides per
    instance.

- [`8f55b4c`](https://github.com/uni-design-system/uni/commit/8f55b4ca34bfa7006c5d55c895b323931a3d6a1b) Thanks [@gaenglish](https://github.com/gaenglish)! - Theme Builder becomes the full playground (PRD §5.2)
  - **Light & dark side by side**: both palettes generate on every input change,
    independent of the storybook-wide mode toggle, each rendered in its own panel.
  - **Contrast report panel**: live pass/fail matrix over all checked pairs (summary +
    failing rows always visible, full detail on demand). Failures only occur with hard
    brand pins; the panel says so and points at soft targets.
  - **Shape language input** (`sharp`/`modern`/`playful`): applies `ShapeRadii` live via
    the new `radii` pass-through on `BrandPaletteConfig`/`createThemeFromPalette`.
  - **Export paths**: copy the static `uni-theme.ts` (via `emitThemeFile`), copy a
    pre-encoded `ng add` command, or copy W3C DTCG JSON for both modes via the new
    `emitDtcgTokens()` interop emitter in uni-core (Style Dictionary compatible).

## 5.1.0

### Patch Changes

- [`f2951db`](https://github.com/uni-design-system/uni/commit/f2951db7f6267f29b56d127151ff843d445c40a4) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix `ng add` against real published packages (found by fresh `ng new` e2e):
  - The schematic bundle is CJS, but ng-packagr stamps `"type": "module"` into the
    published package.json, so Node loaded it as ESM and the CLI reported "no ng add
    actions". A nested `schematics/package.json` (`"type": "commonjs"`) scopes the
    bundle back to CJS.
  - The emitted `uni-theme.ts` used dot access on `Colors` (which has an index
    signature), failing under `ng new`'s strict `noPropertyAccessFromIndexSignature`.
    The emitter (and the MCP tool's guidance) now uses bracket access throughout.
  - `uni-angular`'s peer range on `uni-core` is now `workspace:^` (publishes as `^5.x`)
    instead of `workspace:*` (published as an exact pin). Alongside changesets'
    `onlyUpdatePeerDependentsWhenOutOfRange`, this stops minor releases from being
    inflated to majors by the peer-dependents rule — the cause of the 4.0.0 and 5.0.0
    version jumps.

## 5.0.0

### Minor Changes

- [`f7f0bdd`](https://github.com/uni-design-system/uni/commit/f7f0bdddfac855955e022a852c2bfdccf8013a7b) Thanks [@gaenglish](https://github.com/gaenglish)! - OKLCH theme generation engine (`concepts/generation`)
  - New `generateThemes(input)` / `generateUniThemes(input)`: brand seed(s) in, complete
    WCAG-AA light+dark `Colors` pair out, with a machine-readable `ContrastReport`
    (110 checked pairs per theme pair). Pure and deterministic.
  - All palette math moved from HSL to perceptual OKLCH: uniform lightness slots across
    hues, per-category chroma model (`CategoryChroma`), dark-mode accent chroma decoupling
    (C ≤ 0.16), and a contrast guard-rail that adjusts lightness only — never hue.
  - Brand colors ride as soft `targets` (kept verbatim when already AA, lightness-adjusted
    when not) alongside the existing hard `brand` pins; accepted by `generatePalette`,
    `createThemeFromPalette`, and Angular's `BrandPaletteConfig`.
  - Semantic inks re-tuned per role: error 27°/C 0.20, warn 55°/C 0.18 (rotated off amber —
    dark yellow reads brown), success 152°/C 0.16.
  - `createTheme` accepts optional `radii`/`shadows` overrides; `ShapeRadii` presets
    (`sharp` / `modern` / `playful`) emitted via the `shape` generation input.
  - Theme Builder ships nine curated AA-clean presets built on soft targets.
  - Deprecated (thin wrappers/tables retained): `uniColor`, `randomRangeValue`,
    `CategorySaturation`, `CategoryLightness`. `schemeHues` moved to `color.utils`.
  - `createTheme` deep-merges optional `borders` and `components` overrides over its
    derived defaults — themes can define custom named primitives and rewire per-component
    options without restating untouched sections.
  - New `emitThemeFile()` renders a static `uni-theme.ts` — literal colors, visible border
    primitives, sparse component overrides — the editable source of truth; the engine
    never ships to the browser.
  - New `ng add @uni-design-system/uni-angular` schematic: installs the peer set, writes
    the generated theme file, registers `UNI_THEMES` in `app.config.ts`, adds typeface
    links, scaffolds a themed smoke test, and prints the contrast summary.
  - New MCP tool `generate-uni-theme`: returns the static theme file content, provider
    snippet, and contrast report, with agent guidance to edit the file for restyling.
  - `uni-core` gains its first Vitest suite, including a 1,080-seed contrast property
    corpus with zero tolerance in both modes; the schematic gets its own spec suite.

### Patch Changes

- Updated dependencies [[`f7f0bdd`](https://github.com/uni-design-system/uni/commit/f7f0bdddfac855955e022a852c2bfdccf8013a7b)]:
  - @uni-design-system/uni-core@5.0.0

## 4.0.0

### Minor Changes

- [`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9) Thanks [@gaenglish](https://github.com/gaenglish)! - Porting Components

### Patch Changes

- Updated dependencies [[`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9)]:
  - @uni-design-system/uni-core@4.0.0

## 3.0.2

### Patch Changes

- [`dcaf166`](https://github.com/uni-design-system/uni/commit/dcaf1668fb94716b192c65137a14f3ea561a0142) Thanks [@gaenglish](https://github.com/gaenglish)! - Extending the Symbol component to support theme options.

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.2

## 3.0.1

### Patch Changes

- [`fabbb73`](https://github.com/uni-design-system/uni/commit/fabbb73e7b2124e14b3cc263b2b8ca43e0cf80bd) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting new components and formatting.

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.1

## 3.0.0

### Minor Changes

- [`54a945c`](https://github.com/uni-design-system/uni/commit/54a945c51635898acb0c8ec0dd93ee234c580228) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting Components, Themes, and CDK

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.0

## 2.0.4

### Patch Changes

- [`ad5dd15`](https://github.com/uni-design-system/uni/commit/ad5dd151d245765b9d24a6ad1370a3e9d0d6b63e) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting multiple Angular Components

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.4

## 2.0.3

### Patch Changes

- [`eb80cff`](https://github.com/uni-design-system/uni/commit/eb80cffaaba0009c1c30875f93ea7e75dcf92302) Thanks [@gaenglish](https://github.com/gaenglish)! - fix: setting dist directory in publishConfig

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.2

## 2.0.1

### Patch Changes

- [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4) Thanks [@gaenglish](https://github.com/gaenglish)! - Setting Fixed Versioning for all packages.

- Updated dependencies [[`e2cad74`](https://github.com/uni-design-system/uni/commit/e2cad74631b3a9d2caf4816bcadedf19db99fec4), [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4)]:
  - @uni-design-system/uni-core@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [[`4a049de`](https://github.com/uni-design-system/uni/commit/4a049def689d56d6b6cc1d2da73c9facd93ed515)]:
  - @uni-design-system/uni-core@1.1.0

## 1.0.0

### Major Changes

- [`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756) Thanks [@gaenglish](https://github.com/gaenglish)! - init release

### Patch Changes

- Updated dependencies [[`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756)]:
  - @uni-design-system/uni-core@1.0.0
