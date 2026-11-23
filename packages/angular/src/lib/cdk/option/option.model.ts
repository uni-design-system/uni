/**
 * How one option's label is set. Type only — family, weight and slant — so a
 * list of typefaces can show each face. Size, line height and color stay the
 * theme's, which is what keeps every row the same height.
 */
export interface OptionLabelStyle {
  /** A CSS `font-family` value. Loading the face is the app's job. */
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
}

export interface Option<T = unknown> {
  label: string;
  value: T;
  /** Secondary line, e.g. an email under a name. Read as part of the option's name. */
  description?: string;
  /** Visible and announced, but not committable; listbox navigation skips it. */
  disabled?: boolean;
  /**
   * Draws this option's label in its own type; the description and the row
   * keep the theme's. Honored by `uni-combobox` only — the native `<option>`
   * behind `uni-select` is drawn by the operating system, and the multi-select
   * controls ignore it.
   */
  labelStyle?: OptionLabelStyle;
}

export type Options<T = unknown> = Option<T>[];
