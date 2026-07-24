import type { ColorKey } from '@uni-design-system/uni-core';

export interface UniRadioOption {
  /**
   * The label displayed for this radio option
   */
  label: string;
  /**
   * The value associated with this radio option
   */
  value: string;
  /**
   * Whether this option is disabled
   */
  disabled?: boolean;
}

export interface UniRadioOptions {
  /**
   * The size of the radio buttons
   */
  size?: number;
  /** Unselected ring color token. */
  ringColor?: ColorKey;
  /** Circle background token. */
  fillColor?: ColorKey;
}
