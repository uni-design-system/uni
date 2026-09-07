import type { ColorKey, Motion } from '@uni-design-system/uni-core';

/**
 * What a variant means for a toggle, as theme data the component reads. The
 * accent fills the checked track and colours the focus ring.
 */
export interface UniToggleVariant {
  /** Checked track fill and focus ring. */
  accent: ColorKey;
}

export interface UniToggleOptions {
  /** Off-state track color token. */
  trackColor?: ColorKey;
  /** Knob color token. */
  knobColor?: ColorKey;
  /**
   * Checked-state track color token. Falls back to the instance's `variant`,
   * which is where this color lived before it had a theme home. The matching
   * `checkedColor` input overrides it per instance.
   */
  checkedColor?: ColorKey;
  /** Motion token for the knob slide and track color change. */
  motion?: Motion;
}
