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
  /**
   * Seconds for the dot's grow/retract and the ring's color change.
   *
   * @deprecated Use `motion` and retime the `control` token instead. Still
   * honoured when set, and wins over `motion`. Removed next major.
   */
  transitionSpeed?: number;
}
