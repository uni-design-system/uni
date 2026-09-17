import type { ColorKey, Motion, NullableSize, Typeface } from '@uni-design-system/uni-core';

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
   * One circle size for every instance, outranking the `sizes` block.
   *
   * @deprecated State the geometry per size token in the component theme's
   * `sizes` block (`{ sm: { height: 16 }, ... }`) so a group's `size` input
   * can reach it. Kept because it is what every theme written before 11.2
   * says, and removing it silently would resize those apps; a theme that sets
   * it still wins everywhere. Removed in 12.0.
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
   * Typeface role for each option's label. Defaults to `label`.
   *
   * Separate from `groupTextRole` because a group heading and the choices
   * under it are two levels of one hierarchy. Sharing `label` — which is what
   * this component did until 11.2 — left a group with no hierarchy at all.
   */
  textRole?: Typeface;
  /** Ink for each option's label. Unset inherits the surrounding on-color. */
  textColor?: ColorKey;
  /** Typeface role for the group heading. Defaults to `label`. */
  groupTextRole?: Typeface;
  /** Ink for the group heading. Unset inherits the surrounding on-color. */
  groupTextColor?: ColorKey;
  /** Space between a circle and its label. Defaults to `sm`. */
  gap?: NullableSize;
  /**
   * Space between the options in the group, and between the heading and the
   * first option. Unset is 12px — the value this component has always drawn,
   * and not a step on the base spacing scale.
   */
  groupGap?: NullableSize;
}
