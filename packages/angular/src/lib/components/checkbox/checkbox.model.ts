import type { ColorKey } from '@uni-design-system/uni-core';

export interface UniCheckboxOptions {
  size?: string | number;
  borderRadius?: string | number;
  /** Unchecked box background token. */
  boxColor?: ColorKey;
  focusRingGap?: string | number;
}
