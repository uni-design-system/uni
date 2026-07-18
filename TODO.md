# Uni Design System — Port Parity TODO

Tracking gaps from the Omni (`oui`) → Uni (`uni`) Angular component port (July 2026).
Status of the port itself: all prototype components are now ported **except** the deliberately
deferred items below.

## Deferred components

### Barcode → future `@uni-design-system/uni-barcode` package
Deliberately not ported (jsbarcode dependency rejected). Plan:
- New workspace package `packages/barcode` with a **pure TypeScript encoder** (framework-agnostic,
  like `uni-core`): input string → abstract bar/space widths + human-readable text.
- Start with **Code 128** (ISO/IEC 15417): 107-pattern table, modulo-103 checksum, automatic
  subset B/C switching (~200–250 lines). Add **EAN-13/UPC-A** (ISO/IEC 15420) next.
- Thin Angular + React wrapper components render the encoder output as SVG (Emotion-styled,
  theme-token aware). No canvas, no runtime deps.

### QR Code → future `@uni-design-system/uni-qrcode` package
Deferred (real lift: ISO/IEC 18004 needs Reed–Solomon over GF(256), version/mode selection,
mask evaluation — ~600–1000 lines plus known-vector tests). Same architecture as barcode:
pure encoder package emitting a module matrix, framework wrappers render SVG.

### App-level components (deferred by decision)
- `pages/` (page, header, footer)
- `print-preview`
- `image-magnifier`

## Ports that intentionally diverge from the prototype

- **scroll-area**: rebuilt natively (ngx-scrollbar removed). Scrollbars styled via Emotion
  `::-webkit-scrollbar` + `scrollbar-width/color` fallback; scrollable-state detection via
  ResizeObserver. Public API preserved (`appearance`, `verticalScrollPadding`, `scrollable`
  output, `scrollToTop/Bottom`). Overlay-style scrollbars ("appearance: compact" in ngx terms)
  now render as thin classic scrollbars — verify visual acceptance in Storybook.
- **debounce-input**: rxjs (`Subject` + `debounceTime`) replaced with signal + `setTimeout`
  debounce; scss file replaced with Emotion. `value` is now a signal (template callers use
  `searchInput.value()`).
- **data-search**: legacy `FormControl`/`ReactiveFormsModule`/`NgIf` replaced with a plain
  signal (`searchValue`).
- **file-drop-zone**: `FormGroup` + rxjs subscription replaced with a native `(change)` handler.
- All new ports use signal `input()`/`output()`/`model()`/`viewChild()` per the
  angular-signals standard, and `Text role=` became `Text typeface=` (uni Text API).

## uni-core changes made during the port (review welcome)

- **Color tokens extended** (`ContainerColorToken`, `ContentColorToken`): added the prototype's
  semantic families — bare containers (`primary`…`success`), `warn/success/disabled/inverse`
  containers (+ `-variant`/`-border` content tokens), and the surface tiers
  (`primary-surface`…`quaternary-surface`, `disabled-surface`). Values added to BaseTheme (light)
  and DarkTheme, derived from the existing M3 purple palette. **Review the chosen hex values.**
- **`typefaces` was an empty object in BaseTheme** — every `Text`/`typeface()` lookup silently
  returned nothing. Now derived from the theme's `typography` block via `toTypefaces()`
  (`concepts/typography/typeface.helpers.ts`) plus hand-added `badge`, `tag`, `input` roles.
- Added `AbsoluteSize` to `concepts/size` (fixed the prototype's `' x-large'` leading-space typo).
- Added `TextColor` (`ContentColorToken | Variant`) to `concepts/theme/theme.types.ts`.
- Added `radio` to `ComponentName`.
- Added `removeInputPlatformStyling` to `concepts/style`.
- `@angular/forms` added as peer + dev dependency of `uni-angular` (Signal Forms controls).

## Known gaps / follow-ups

1. **Jest is not set up** in `packages/angular` — no `jest.config`, no `jest-preset-angular`,
   so all 111 spec files fail on transform before running. Needs a proper Angular 21 jest
   (or vitest) setup. Pre-existing, not introduced by the port.
2. **Specs / stories / MDX docs not ported** for the newly ported components (the prototype has
   them for checkbox, radio, toggle, popover, search-input, select-input, scroll-area, data-table,
   file-drop-zone, tag, etc.). Port once the test runner works; stories can come over mostly 1:1.
3. **`icons: {}` is empty in BaseTheme** (prototype populated it from `icon.record`).
   `ThemeService.icons()` returns `{}` — audit whether anything reads theme icons.
4. **Legacy `@Input()` remnants in earlier-ported components** (badge `width`, icon-button,
   tooltip `appendToBody`, others) — migrate to signal inputs for consistency.
5. **expand-area `collapsed` output never emits** (faithful to a prototype bug). Wire it to the
   toggle's state change.
6. **Hardcoded colors in checkbox/radio/toggle** (`#FFF`, `#ccc`, `#d0d0d0`, `#e0e0e0`) — replace
   with theme tokens (the prototype had the same issue).
7. **notification-badge** relies on `componentOptions().offset` — BaseTheme provides it, but any
   custom theme without it yields `"undefinedpx"`. Consider a fallback.
8. **DarkTheme legacy color keys**: has both `inverse-on-surface` (legacy) and the canonical
   `on-inverse-surface` (added). Clean up once nothing references the legacy spelling.
9. **Prototype cdk modules not yet ported**: `breakpoint`, `clipboard`, `common/validation`,
   `image`, `save`, `scroll`. Port on demand.
10. **Prototype extras not ported**: `theme-switcher` addon, `translation` module, `versions`
    addon, ATB brand themes (`atb.theme.ts`, `atb-dark.theme.ts`).
11. **multi-select-dropdown search is not debounced** (prototype had this commented out too).
    Could debounce the `query` signal like debounce-input.
12. **paginator** `pageBorder` option is defined but unused (prototype parity) — remove or use.
13. **Storybook coverage** for the ~20 newly ported components.
