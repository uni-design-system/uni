import type { ColorKey, RadiiSize, Typeface } from '@uni-design-system/uni-core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ButtonProps {}

/**
 * What a variant means for a button, as theme data the component reads.
 *
 * Only the keyboard-focus indicator lives here. Everything else a variant does
 * to a button is ordinary CSS and belongs in its `variants` style block; the
 * ring is different because it is drawn *outside* the element, so it cannot
 * take its colour from the fill and has to be named separately.
 */
export interface UniButtonVariant {
  /**
   * Keyboard-focus ring colour (WCAG 2.4.7).
   *
   * Falls back to the reserved `primary` accent. It must never resolve to
   * nothing: the ring used to take the variant *name* as a colour token, which
   * left `ghost` with a transparent outline and every unthemed or
   * consumer-registered intent with `2px solid undefined` — dropped by the CSS
   * parser, so the ring simply vanished while `outline-offset` survived and
   * kept the layout looking correct.
   */
  focusColor?: ColorKey;
}

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
