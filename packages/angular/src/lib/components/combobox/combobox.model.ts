import type { ContentColorToken, ContainerColorToken, Radius, Shadow } from '@uni-design-system/uni-core';

/** A commit was refused (no match); the field reverted to the committed label. */
export interface UniComboboxRejection {
  query: string;
}

/**
 * Theme options for the `combobox` entry. Field chrome is not duplicated
 * here — it comes from `input` via uni-input-box; the list trio matches
 * tagInput/searchInput/timeInput.
 */
export interface UniComboboxOptions {
  toggleSymbol?: string;
  clearSymbol?: string;
  selectedSymbol?: string;
  listColor?: ContainerColorToken;
  listShadow?: Shadow;
  listBorderRadius?: Radius;
  /** Active/hover option fill; the on-color pair is derived. Must contrast
      with `listColor` or keyboard navigation turns invisible. */
  activeColor?: ContainerColorToken;
  /** Scroll height in rows — the list scrolls past this, never truncates. */
  maxVisibleOptions?: number;
  descriptionColor?: ContentColorToken;
}
