import type { ColorKey, NullableSize } from '@uni-design-system/uni-core';

/**
 * Theme options for `uni-inline-button` — the `inlineButton` theme entry.
 *
 * The control exists because the alternatives distort a sentence: a `ghost`
 * button brings padding and a hit area that push the surrounding words apart,
 * and a bare `<a>` gives navigation semantics to something that only acts.
 */
export interface UniInlineButtonOptions {
  /** Ink when `link` is set. Defaults to `primary`. */
  linkColor?: ColorKey;
  /** Underline by default, so a theme can make every inline button read as a link. */
  underline?: boolean;
  /** Underline on hover even when `underline` is off. Defaults to true. */
  underlineOnHover?: boolean;
  /** Distance from the text baseline to the underline. Defaults to `0.15em`. */
  underlineOffset?: string;
  /** Space between the glyph and the label, as a spacing token. Defaults to `xxs`. */
  gap?: NullableSize;
  /** Focus ring colour. Defaults to the shared focus ring. */
  focusColor?: ColorKey;
}
