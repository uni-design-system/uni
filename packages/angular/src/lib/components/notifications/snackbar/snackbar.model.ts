import type { Motion } from '@uni-design-system/uni-core';

export interface UniSnackbarOptions {
  bottomPosition: number;
  /** Named motion primitive for the enter/leave transition. Defaults to
      `notification`. */
  motion?: Motion;
  autoCloseDelay: number;
}
