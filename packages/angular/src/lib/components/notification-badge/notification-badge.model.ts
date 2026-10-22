import type { RadiiSize, Typeface } from '@uni-design-system/uni-core';

/**
 * Theme options for `uni-notification-badge`. The disc's size comes from the
 * entry's `sizes` block (`{ sm: { height: 14 }, … }`), keyed by the `size`
 * input; the count's type from `typeface`.
 */
export interface UniNotificationBadgeOptions {
  borderRadius?: RadiiSize;
  /**
   * How far past the wrapped element's corner the badge sits, in px; negative
   * hangs it outward. The default, -10, suits an icon button, where half the
   * disc overhangs the box. It should scale with what is wrapped: on a text
   * link the same value floats the whole disc clear of the word, and about -4
   * reads as "on the corner".
   */
  offset?: number;
  /** Type role for the count. Defaults to `overline`. */
  typeface?: Typeface;
}
