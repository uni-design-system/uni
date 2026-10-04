import type { OptionalSize, Size, Typeface, Variant } from '@uni-design-system/uni-core';

/**
 * A person. `value` is canonical — what a form submits — and is usually the
 * email address; everything else is presentation.
 *
 * `{ value: 'a@b.com' }` is a complete contact.
 */
export interface UniContact {
  /** Canonical value: an email address, or an id for a closed directory. */
  value: string;
  /** Display name; the chip and the row fall back to `value`. */
  name?: string;
  /**
   * Line under the name in the suggestion row. Defaults to `value` when a
   * name is shown — set it when `value` is an id rather than an address.
   */
  email?: string;
  avatarSrc?: string;
  /** Trailing aside in the row, e.g. a role or where they are known from. */
  note?: string;
  /**
   * Heading shown above the first of each run of contacts sharing it. The
   * field does not sort — order `contacts` so groups are contiguous.
   */
  group?: string;
  /** Locked chip (e.g. a thread owner): rendered without a remove control. */
  disabled?: boolean;
}

/**
 * Theme options for the `contactInput` entry — the person row only. The popup
 * surface, option typeface and width come from `tagInput`, the chips from
 * `tag`, the field chrome from `input`.
 */
export interface UniContactInputOptions {
  /** Avatar size token in the suggestion row. */
  avatarSize?: Size;
  /** Avatar colour role in the suggestion row — one of the `avatar` entry's
      variants. Re-point it when the default disappears into the list surface. */
  avatarVariant?: Variant;
  /** Typeface of the name line. */
  nameTypeface?: Typeface;
  /** Typeface of the address line and the trailing note. */
  detailTypeface?: Typeface;
  /** Space between the avatar and the text. */
  rowGap?: OptionalSize;
}
