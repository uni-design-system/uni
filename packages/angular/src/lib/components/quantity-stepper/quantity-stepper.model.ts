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
 * Unlike the other numeric controls this does **not** inherit the shared
 * `input` chrome — it is not a field, has no label and no error border — so it
 * carries its own container tokens. They default to the same values `input`
 * uses, so a cart stepper and a form field look related out of the box, and a
 * theme can part them without editing every field.
 *
 * Height comes from the `sizes` block (`sm` 24 / `md` 32 / `lg` 40) rather than
 * an option, and it is the *outer* height, so an `md` stepper lines up with a
 * 32px field. The buttons are square at it: `md` and `lg` clear the 24×24
 * pointer target of WCAG 2.2 SC 2.5.8, while `sm` leaves 22px inside its border
 * and is therefore the dense desktop option.
 */
export interface UniQuantityStepperOptions {
  color?: ContainerColorToken;
  border?: Border;
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
  /** Minimum width of the value, e.g. `'3ch'`. Stops a step reflowing the row. */
  valueWidth?: string | number;
}
