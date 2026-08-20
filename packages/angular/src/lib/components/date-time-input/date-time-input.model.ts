import type { ColorToken, NullableSize } from '@uni-design-system/uni-core';
import type { UniDate, UniDateTime, UniTime } from '../../cdk';

export type { UniDate, UniDateTime, UniTime };

/**
 * Theme options for the `dateTimeInput` entry. Field chrome comes from
 * `input` via the single shared uni-input-box; these style the seam between
 * the two parts.
 */
export interface UniDateTimeInputOptions {
  /** Space between the date part, the divider, and the time part. */
  partGap?: NullableSize;
  dividerColor?: ColorToken;
}
