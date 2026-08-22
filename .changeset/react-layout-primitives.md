---
'@uni-design-system/uni-react': minor
---

React layout primitives, at parity with Angular: `Box`, `Stack`, `Row`, `Center`, `Wrap`, `Grid` and `GridArea`. Angular applies layout as an attribute so the element's semantics stay the author's (`<main box-layout>`); React's equivalent is the polymorphic `as` prop — `<Box as="main" padding="md">` — with refs and DOM props forwarded to whatever element it renders.

Props, defaults and resolution order are ported one-for-one from `UniBoxComponent`, so the same tokens produce the same CSS in both frameworks: token-driven color pairs, padding, radius, border, shadow, gap and z-index; a number is px and a string is a CSS length for every sizing prop; `dashBorder` draws the SVG dashed outline; `ignoreDir` (default on) still flips flex direction under `dir="rtl"`. `Stack` keeps its `minHeight: fit-content` guard and `Row` its `minWidth: fit-content` — set `minHeight={0}` / `minWidth={0}` to shrink inside a constrained flex parent.

Supporting this: `createThemeStyles`/`useThemeStyles` — the React port of the Angular `ThemeService` token → CSS resolvers, method-for-method — and `@emotion/css` (new peer dependency, matching the Angular package) so pseudo-selectors like `:dir(rtl)` resolve in a real class rather than an inline style. A Box that paints a container color now also provides that token to its descendants, so `Text` inside it picks up the matching on-color.
