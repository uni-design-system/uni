import type { Elevation, Motion, Radius, Variant } from '@uni-design-system/uni-core';

export interface UniAlertOptions {
  defaultVariant: Variant;
  borderRadius: Radius;
  /** Named motion primitive for the enter/leave transition. Defaults to
      `notification`. */
  motion?: Motion;
  /**
   * Enter/leave transition in seconds.
   *
   * @deprecated Use `motion` and retime the `notification` token instead.
   * Still honoured when set, and wins over `motion`. Removed next major.
   */
  transitionSpeed?: number;
  topPosition: string | number;
  elevation: Elevation;
}
