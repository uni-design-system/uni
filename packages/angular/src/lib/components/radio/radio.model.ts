import type { ColorKey, Motion } from '@uni-design-system/uni-core';

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

/**
 * What a variant means for a radio, as theme data the component reads. The
 * accent lands on the dot, the hover and checked rings, and the focus ring.
 */
export interface UniRadioVariant {
  /** Dot fill, checked/hover ring and focus ring. */
  accent: ColorKey;
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
  /** Named motion primitive for the dot's grow/retract and the ring's color
      change. Defaults to `control`; a token with `duration: 0` is instant. */
  motion?: Motion;
}
