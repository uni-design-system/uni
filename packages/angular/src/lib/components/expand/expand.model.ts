import type { Motion } from '@uni-design-system/uni-core';

/** Theme-level options for `uni-expand`. */
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
   * Base reveal/collapse duration in seconds.
   *
   * @deprecated Use `motion` and retime the `reveal` token instead — one edit
   * covers the region and its toggle together. Still honoured when set, and
   * wins over `motion`, so existing themes are unaffected. Removed next major.
   */
  transitionSpeed?: number;
}
