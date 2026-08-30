import type {
  Border,
  ColorKey,
  ContainerColorToken,
  IconName,
  Radius,
} from '@uni-design-system/uni-core';

/**
 * Theme-level options for `uni-quantity-stepper`.
 *
 * It is not a field — no label, no error border, no `uni-input-box` — but it
 * sits beside fields in carts and table rows, so its container **defaults to
 * the shared `input` chrome**: colour, border, radius and the focus indicator
 * all follow whatever a theme does to its fields. The options below are
 * per-component overrides, for parting them deliberately.
 *
 * Height comes from the `sizes` block (`sm` 24 / `md` 32 / `lg` 40) rather than
 * an option, and it is the *outer* height, so an `md` stepper lines up with a
 * 32px field. The buttons are square at it: `md` and `lg` clear the 24×24
 * pointer target of WCAG 2.2 SC 2.5.8, while `sm` leaves 22px inside its border
 * and is therefore the dense desktop option.
 */
export interface UniQuantityStepperOptions {
  /** Container fill. Unset — the default — takes `input`'s. */
  color?: ContainerColorToken;
  /** Frame, and the rules either side of the value. Unset takes `input`'s. */
  border?: Border;
  /** Corner radius. Unset takes `input`'s. */
  borderRadius?: Radius;
  /**
   * Colour override for the rules between the buttons and the value. Unset —
   * the default — means they take `border`, so the frame reads as one weight
   * and the dividers follow the focus border. Set this only for a deliberately
   * distinct divider.
   */
  dividerColor?: ColorKey;
  incrementIcon?: IconName;
  decrementIcon?: IconName;
  /** Replaces the decrement glyph at `min` when `deleteAtMin` is set. */
  deleteIcon?: IconName;
  /** `font-variant-numeric: tabular-nums`, so held stepping does not jitter. */
  tabularNumerals?: boolean;
  /**
   * Floor for the value cell, e.g. `'3ch'` — headroom so stepping 9 → 10 does
   * not reflow the row. Beyond it the cell grows with the digits, because the
   * input is sized from its content rather than the browser's 20-character
   * default.
   */
  valueWidth?: string | number;
}
