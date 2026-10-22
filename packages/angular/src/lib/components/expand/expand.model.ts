import type { ColorKey, Motion, Typeface } from '@uni-design-system/uni-core';

/** Theme-level options for `uni-expand` and its `uni-expand-toggle` trigger. */
export interface UniExpandOptions {
  /**
   * Named motion primitive for the reveal. Defaults to `reveal`, whose
   * duration is the *base* speed at a 240px-tall region — the actual duration
   * scales with content height (√-of-height, clamped — `expandDuration` in
   * uni-core) so short regions stay snappy and tall ones aren't rushed. Its
   * easing drives the animation curve, and `uni-expand-toggle`'s chevron
   * reads the same token so trigger and region move on one clock.
   */
  motion?: Motion;
  /**
   * Typeface role for a labelled toggle's label. Defaults to `label` — in a
   * scale where that is the caps eyebrow above a field, point it at a body
   * role, as the selection controls' `textRole` does.
   */
  textRole?: Typeface;
  /** Ink for the label. Unset inherits the surrounding on-color. */
  textColor?: ColorKey;
  /** Typeface role for the muted sublabel. Defaults to `caption`. */
  sublabelRole?: Typeface;
  /** Ink for the sublabel. Defaults to `on-background-variant`. */
  sublabelColor?: ColorKey;
}
