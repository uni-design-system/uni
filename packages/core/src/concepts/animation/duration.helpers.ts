/** Duration (seconds) the default theme assigns `expand`'s `transitionSpeed`. */
export const EXPAND_DEFAULT_SPEED = 0.35;

/**
 * Content height (px) at which a reveal runs at exactly its `transitionSpeed`.
 * Roughly a few lines of card content — the size the default 0.35s was tuned on.
 */
export const EXPAND_REFERENCE_HEIGHT = 240;

/**
 * Duration envelope at the default speed. A tiny region never blinks past
 * faster than the min; a full-page region never drags longer than the max.
 * Expressed at `EXPAND_DEFAULT_SPEED` and applied as scale-factor clamps, so a
 * theme that slows `transitionSpeed` down widens its envelope proportionally
 * instead of being capped back to the stock feel.
 */
export const EXPAND_MIN_DURATION = 0.15;
export const EXPAND_MAX_DURATION = 0.6;

const MIN_SCALE = EXPAND_MIN_DURATION / EXPAND_DEFAULT_SPEED;
const MAX_SCALE = EXPAND_MAX_DURATION / EXPAND_DEFAULT_SPEED;

/**
 * Size-aware reveal duration: `speed × √(height ÷ reference)`, clamped.
 *
 * A fixed duration reads as sluggish on a short region and rushed on a tall
 * one; scaling by the square root of height keeps perceived speed steady —
 * bigger reveals get more time, but sublinearly.
 */
export const expandDuration = (
  contentHeight: number,
  speed: number = EXPAND_DEFAULT_SPEED,
): number => {
  const height = Number.isFinite(contentHeight) ? Math.max(contentHeight, 0) : 0;
  const scale = Math.sqrt(height / EXPAND_REFERENCE_HEIGHT);
  return speed * Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
};
