import type { ContainerColorToken, Radius, Shadow } from '@uni-design-system/uni-core';
import type { UniDate } from '../../cdk';

export type { UniDate };

/** Why typed text did not become a date. The raw text stays in the field. */
export interface UniDateInputRejection {
  raw: string;
  reason: 'unparseable' | 'out-of-range' | 'disabled';
}

/**
 * Theme options for the `dateInput` entry. Field chrome is not duplicated
 * here — it comes from `input` via uni-input-box; these style the popup
 * affordance and panel only.
 */
export interface UniDateInputOptions {
  toggleSymbol?: string;
  popupShadow?: Shadow;
  popupBorderRadius?: Radius;
  popupColor?: ContainerColorToken;
}
