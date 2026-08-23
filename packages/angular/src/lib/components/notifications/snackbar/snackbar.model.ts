import type { Motion } from '@uni-design-system/uni-core';

export interface UniSnackbarOptions {
  bottomPosition: number;
  /** Named motion primitive for the enter/leave transition. Defaults to
      `notification`. */
  motion?: Motion;
  /**
   * Transition duration as a CSS time, e.g. `'0.35s'`.
   *
   * @deprecated Use `motion` and retime the `notification` token instead.
   * Still honoured when set, and wins over `motion`. Removed next major.
   */
  transitionDelay?: string;
  autoCloseDelay: number;
}
