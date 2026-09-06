import type { IconName, Motion, NullableSize, Radius, Typeface } from '@uni-design-system/uni-core';

/** Theme options for the `tag` component entry. */
export interface UniTagOptions {
  /** Named motion primitive for the fill and ink transition. Defaults to `control`. */
  motion?: Motion;
  borderRadius?: Radius;
  typeface?: Typeface;
  /** Space between the lead element, label and remove button. */
  gap?: NullableSize;
  /** Icon primitive for the remove affordance. */
  removeIcon?: IconName;
  /** Icon primitive shown in the lead slot when the chip is selected. */
  selectedIcon?: IconName;
}

/** The value a tag echoes back on `removed` / `activated`. */
export type UniTagValue = string | number | undefined;
