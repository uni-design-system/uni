import type { Border, Elevation, Radius, Variant } from '@uni-design-system/uni-core';

/** Theme-level options for `uni-card`, resolved by token name. */
export interface UniCardOptions {
  defaultVariant?: Variant;
  /** Corner radius as a radii token. The default theme uses `xs`. */
  borderRadius?: Radius;
  /**
   * Frame as a border primitive token. When unset, the card follows its
   * variant — `borders.primary`, `borders.warn`, … — so redefining a border
   * primitive restyles every card (and every other component) sharing it.
   */
  border?: Border;
  /** Optional elevation shadow token; cards are flat by default. */
  elevation?: Elevation;
  transitionSpeed?: number;
}
