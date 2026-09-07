import type { ColorKey } from '@uni-design-system/uni-core';

/**
 * Theme options for `uni-progress-bar`. Declared in `ComponentName` with no
 * entry behind it until 11.0.0, so the bar picked its colours straight off the
 * palette and a theme had no way to re-point them.
 */
export interface UniProgressBarOptions {
  /** Unfilled track. Defaults to `primary-surface`. */
  trackColor?: ColorKey;
  /** Fill while in progress. Defaults to `secondary-surface`. */
  fillColor?: ColorKey;
  /** Fill once complete. Defaults to `secondary`. */
  completeColor?: ColorKey;
  /** Outline on both track and fill. Defaults to `on-background-variant`. */
  borderColor?: ColorKey;
  /** Outline width in px. Defaults to 1. */
  strokeWidth?: number;
}
