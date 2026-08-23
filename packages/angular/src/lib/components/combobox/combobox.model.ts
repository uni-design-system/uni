import type {
  Motion,
  ContentColorToken,
  ContainerColorToken,
  IconName,
  Radius,
  Shadow,
} from '@uni-design-system/uni-core';

/** A commit was refused (no match); the field reverted to the committed label. */
export interface UniComboboxRejection {
  query: string;
}

/**
 * Theme options for the `combobox` entry. Field chrome is not duplicated
 * here — it comes from `input` via uni-input-box; the list trio matches
 * tagInput/searchInput/timeInput. Glyphs are theme icon primitives rendered
 * by `uni-icon`, so they restyle with the theme's iconography.
 */
export interface UniComboboxOptions {
  toggleIcon?: IconName;
  clearIcon?: IconName;
  selectedIcon?: IconName;
  listColor?: ContainerColorToken;
  listShadow?: Shadow;
  listBorderRadius?: Radius;
  /** Active/hover option fill; the on-color pair is derived. Must contrast
      with `listColor` or keyboard navigation turns invisible. */
  activeColor?: ContainerColorToken;
  /** Scroll height in rows — the list scrolls past this, never truncates. */
  maxVisibleOptions?: number;
  descriptionColor?: ContentColorToken;  /** Named motion primitive for the suggestion popup's open animation.
      Defaults to `popup` — the token `uni-dropdown` uses. */
  motion?: Motion;
}
