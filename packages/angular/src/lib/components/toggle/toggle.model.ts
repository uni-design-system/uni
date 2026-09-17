import type { ColorKey, Motion, NullableSize, Typeface } from '@uni-design-system/uni-core';

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
  /**
   * Typeface role for the rendered label. Defaults to `label`.
   *
   * It is a role, not a set of type properties, because the label beside a
   * switch is ordinary copy in one theme's scale and a caption in another's
   * — `label` is the caption above a field in most type scales, which is the
   * wrong voice for a sentence the user reads.
   */
  textRole?: Typeface;
  /** Ink for the rendered label. Unset inherits the surrounding on-color. */
  textColor?: ColorKey;
  /** Space between the track and its label. Defaults to `sm`. */
  gap?: NullableSize;
}
