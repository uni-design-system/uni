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
  /**
   * @deprecated Track height in px, from before the toggle had a `sizes` block.
   * Still honoured — and still wins when set, since a theme carrying it opted
   * into the old derived-ratio geometry (width = 2x, knob = 0.8x) — but it
   * applies to every instance regardless of the `size` input. Prefer the
   * theme's `toggle.sizes` block, which gives each size token its own
   * `width` / `height` / `padding`.
   */
  size?: number;
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
