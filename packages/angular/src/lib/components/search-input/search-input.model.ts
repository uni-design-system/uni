import type { ColorKey, Radius, Shadow } from '@uni-design-system/uni-core';

/** Theme-level options for `uni-search-input`, resolved by token name. */
export interface UniSearchInputOptions {
  /** Leading (decorative) symbol. */
  searchSymbol?: string;
  /** Clear-button symbol. */
  clearSymbol?: string;
  /** Suggestion list surface color token. */
  listColor?: ColorKey;
  /** Suggestion list elevation token. */
  listShadow?: Shadow;
  /** Suggestion list radius token. */
  listBorderRadius?: Radius;
  /** Cap on rendered suggestions. */
  maxSuggestions?: number;
}
