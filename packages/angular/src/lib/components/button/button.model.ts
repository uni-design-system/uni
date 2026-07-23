import type { RadiiSize, Typeface } from '@uni-design-system/uni-core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ButtonProps {}

/** Theme-level options for `uni-text-button`, resolved by token name. */
export interface UniButtonOptions {
  /**
   * Corner radius as a radii token. The default theme uses `max` (pill);
   * because this is a token, the theme's radii scale — including generated
   * shape languages (`sharp`/`modern`/`playful`) and custom primitives —
   * restyles every button without touching component code.
   */
  borderRadius?: RadiiSize;
  /**
   * Label typography as a typeface token. Defaults to the type scale's
   * `button` role (family/weight/transform); per-size `fontSize` overrides
   * from the theme's `sizes` still apply on top. Point it at any typeface —
   * including custom primitives added to the theme's typography.
   */
  typeface?: Typeface;
}
