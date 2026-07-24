import type { ColorKey } from '@uni-design-system/uni-core';

export interface UniToggleOptions {
  /**
   * The size of the toggle switch
   */
  size?: number;
  /** Off-state track color token. */
  trackColor?: ColorKey;
  /** Knob color token. */
  knobColor?: ColorKey;
}
