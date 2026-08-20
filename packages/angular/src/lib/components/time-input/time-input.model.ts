import type { ContainerColorToken, Radius, Shadow } from '@uni-design-system/uni-core';
import type { UniTime } from '../../cdk';

export type { UniTime };

/** Why typed text did not become a time. The raw text stays in the field. */
export interface UniTimeInputRejection {
  raw: string;
  reason: 'unparseable' | 'out-of-range' | 'unavailable';
}

/**
 * Theme options for the `timeInput` entry. Field chrome is not duplicated
 * here — it comes from `input` via uni-input-box; the list trio matches
 * tagInput/searchInput.
 */
export interface UniTimeInputOptions {
  toggleSymbol?: string;
  listColor?: ContainerColorToken;
  listShadow?: Shadow;
  listBorderRadius?: Radius;
  maxVisibleOptions?: number;
}
