# @uni-design-system/uni-core

## 7.2.0

### Minor Changes

- [`e72ec94`](https://github.com/uni-design-system/uni/commit/e72ec9410bb12d677c9c9102ccaf3e5bf4e8790e) Thanks [@gaenglish](https://github.com/gaenglish)! - Add `funnel` and `building` icons

  Two gaps found while migrating a real app off inline SVG — both cases where the
  existing set forced the app to keep hand-drawn artwork.
  - **`funnel`** (`filter_alt`) — `filter` is `filter_list`, the stacked-lines
    metaphor. Apps that name the feature itself a funnel ("Funnel Analytics") draw
    the shape, and substituting stacked lines loses the reference.
  - **`building`** (`apartment`) — pairs with `home` for residential-vs-commercial
    distinctions, which had no built-in counterpart.

  Both are Material Symbols Outlined 300 on the shared `0 -960 960 960` grid, so
  the set is now 61 icons. Note `building` carries more internal detail than most
  of the set; it reads well from ~14px but goes muddy below ~12px, so prefer a
  larger size or `home`'s simpler silhouette in very small badges.

## 7.1.0

### Minor Changes

- [`c2421c0`](https://github.com/uni-design-system/uni/commit/c2421c04d01f36d74b489613d22997553f256d4f) Thanks [@gaenglish](https://github.com/gaenglish)! - Expand `BaseIcons` to 59 icons and add `uni-icon` sizing

  The 34-icon set shipped in 7.0.0 covered the library's own components but not a
  real application — an app migrating off inline `<svg>` (or off `uni-symbol`, in
  Angular) ran out of names almost immediately. Everything here is additive; all
  34 existing names are unchanged.
  - **25 new icons**, same Material Symbols Outlined 300 source and the same
    `0 -960 960 960` grid as the rest of the set: navigation (`link`, `expand`,
    `gridView`, `listView`), actions (`moreHorizontal`, `copy`, `send`,
    `refresh`, `dragHandle`, `qrCode`), feedback (`star`, `verified`) and
    user/system (`group`, `shieldPerson`, `clock`, `mail`, `chat`, `image`,
    `document`, `payment`, `bank`, `trendingUp`, `extension`, `webhook`,
    `logout`).
    - `moreHorizontal` ships alongside `more` because that one is `more_vert` and
      row-aligned menus need the horizontal kebab.
    - `star` is separate from `favorite`, which is the heart.
  - **`uni-icon` gains an optional `size` input** (`CssLength` — bare numbers are
    px, strings pass through, so `20` and `'1.25rem'` both work). Left unset,
    behaviour is unchanged: the icon fills its container, which is what lets a
    themed control size its own glyph through padding. Set, it applies
    width/height as inline styles, so an explicit size wins over the
    fill-the-container rule regardless of style injection order. This removes the
    per-call-site `width`/`height` CSS rule that replacing an inline `<svg>` with
    `<uni-icon>` would otherwise need.
  - The MCP `create-icon-tokens` tool now lists the built-in icon names above the
    token map it returns. Apps routinely hand-draw their own `close`, `check` or
    `plus`; encoding those into theme tokens works but adds redundant artwork on a
    foreign grid when the theme already ships the glyph. The tool cannot recognise
    a shape, so it hands the caller the list to check against before adding
    anything.

## 7.0.0

### Major Changes

- [`f7727aa`](https://github.com/uni-design-system/uni/commit/f7727aa8895bd67f285ba4830858f994490bb7f7) Thanks [@gaenglish](https://github.com/gaenglish)! - Replace `BaseIcons` with a normalized 34-icon Material Symbols set

  The built-in icon set was 11 glyphs drawn from four different grids
  (`0 0 24 24`, `0 0 50 50`, `0 0 64 64`, `0 -960 960 960`), so `checkCircle` and
  `xCircle` rendered as solid filled discs next to a hairline `alertCircle` and an
  oversized `close` — three optical weights in one set.
  - `BaseIcons` is now Material Symbols Outlined at weight 300, every glyph on a
    single `0 -960 960 960` grid, grouped by intent: navigation (`menu`,
    `chevronUp/Down/Left/Right`, `arrowLeft/Right`, `home`, `externalLink`),
    actions (`search`, `close`, `plus`, `minus`, `more`, `delete`, `edit`,
    `download`, `upload`, `share`, `filter`), feedback (`check`, `checkCircle`,
    `xCircle`, `alertCircle`, `info`, `warning`, `lock`) and user/system
    (`profile`, `settings`, `notification`, `favorite`, `help`, `calendar`).
  - All 11 previously shipped names are preserved, so existing `<uni-icon>` call
    sites and theme overrides keep working. Their **appearance changes**: the
    filled `checkCircle`/`xCircle` are now outlined, and the set reads lighter
    overall. `spinner` is carried over verbatim, keyframes intact.
  - New `IconName` and `BaseIconName` types. `IconName` is
    `BaseIconName | (string & {})`, so built-ins autocomplete and typos surface
    while themes can still register arbitrary names via `createTheme({ icons })`.
    `uni-icon`'s `name` input is typed with it instead of `keyof Icons`.
  - **Breaking**: removes the unused `IconToken`, `IconStyle`, `ToggleableIcon`
    and `IconConfig` exports. Nothing in the library referenced them and
    `IconToken`'s 60-name union contradicted the actual `BaseIcons` keys. Use
    `IconName` instead.
  - New exported `svgToIconUri(svg, options?)` — the supported way to bring your
    own icons (a brand set, a designer handoff) into a theme. It normalizes the
    source (drops the xml declaration, comments and fixed `width`/`height` so the
    mask scales), percent-encodes it, and **rejects artwork that cannot survive
    masking**: no `viewBox`, an embedded raster `<image>`, an external reference,
    a gradient/pattern fill, or more than one paint color. That last one is the
    trap worth naming — masks use the alpha channel, so a multi-color logo
    flattens to a silhouette in `currentColor`; pass `{ allowMultiColor: true }`
    when that is intended. `createTheme({ icons })` merges the result over
    `BaseIcons` per name, so a built-in name reskins and a new name is added.
  - New MCP tool `create-icon-tokens`, the agent-facing front end to
    `svgToIconUri`: hand it a project's inline `<svg>` (or a brand set) and it
    returns a paste-ready `icons` map for `uni-theme.ts`. It encodes via the same
    helper, so tokens are byte-identical to the built-in set, and adds the
    set-level checks a per-icon helper cannot make — which names override
    built-ins, and whether the artwork mixes viewBox grids. Bad artwork is
    reported per icon rather than failing the batch, and re-running is safe
    (already-encoded URIs pass through). The server instructions now point agents
    at it whenever they encounter inline SVG.
  - `BaseIcons` is generated by `scripts/generate-icons.mjs` (`pnpm icons:generate`),
    which fetches from the canonical Material Symbols source and validates every
    glyph before writing — a malformed path, an off-grid viewBox or geometry
    outside the grid aborts the run. `pnpm icons:check` verifies the committed
    file without writing. Add or change icons in that script's manifest and
    regenerate; the file is not hand-edited. `icon.records.spec.ts` asserts the
    same invariants against the committed output.

## 6.1.0

### Minor Changes

- [`28323ec`](https://github.com/uni-design-system/uni/commit/28323eca4ff239953de6dee9c34d34704627171e) Thanks [@gaenglish](https://github.com/gaenglish)! - TextStyle now accepts CSS length strings, not just px numbers
  - `fontSize`, `lineHeight`, `letterSpacing`, `textIndent`, and `wordSpacing` on
    `TextStyle` are widened from `number` to the new exported `CssLength`
    (`number | string`). Bare numbers still mean px, matching Emotion's own
    convention; strings pass through verbatim, so any unit the CSS engine accepts
    works — `'1.2rem'`, `'2em'`, `'clamp(1rem, 2vw, 1.5rem)'`, unitless
    line-height multipliers like `'1.5'`, etc.
  - `toTypeface` no longer blindly appends `px`: numbers are converted, strings
    are passed through untouched. Existing numeric themes are unaffected.

## 6.0.1

## 6.0.0

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

### Minor Changes

- [`c1dc853`](https://github.com/uni-design-system/uni/commit/c1dc853f762a27c466b033709ec84876b708995c) Thanks [@gaenglish](https://github.com/gaenglish)! - Brand-tinted, theme-scoped elevation shadows (PRD §3.5.C)
  - New `generateShadows(colors, mode)`: light themes replace the dead-neutral
    `rgba(0,0,0,…)` stacks with a shadow ink pulled toward the brand hue; dark themes go
    near-zero (`raised: none`) with only a faint veil on floating overlays — elevation
    reads from the surface lightness steps instead. The `warn` glow is tinted with the
    theme's own error color in both modes.
  - `generateThemes` now returns `lightShadows`/`darkShadows`; `generateUniThemes`,
    `createThemeFromPalette` (Theme Builder), the emitted `uni-theme.ts`, and the shipped
    stock Light/Dark themes all carry them.

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

## 4.0.0

### Minor Changes

- [`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9) Thanks [@gaenglish](https://github.com/gaenglish)! - Porting Components

## 3.0.2

## 3.0.1

## 3.0.0

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

### Patch Changes

- [`e2cad74`](https://github.com/uni-design-system/uni/commit/e2cad74631b3a9d2caf4816bcadedf19db99fec4) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix: switch to bundled dual-package distribution via Vite to resolve strict ESM relative path failures

- [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4) Thanks [@gaenglish](https://github.com/gaenglish)! - Setting Fixed Versioning for all packages.

## 1.1.0

### Minor Changes

- [`4a049de`](https://github.com/uni-design-system/uni/commit/4a049def689d56d6b6cc1d2da73c9facd93ed515) Thanks [@gaenglish](https://github.com/gaenglish)! - Adding cjs support

## 1.0.0

### Major Changes

- [`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756) Thanks [@gaenglish](https://github.com/gaenglish)! - init release
