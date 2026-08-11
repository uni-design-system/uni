import type { NullableSize, Radius, Typeface } from '@uni-design-system/uni-core';

/** Theme options for the `tag` component entry. */
export interface UniTagOptions {
  borderRadius?: Radius;
  typeface?: Typeface;
  /** Space between the lead element, label and remove button. */
  gap?: NullableSize;
  /** Symbol ligature for the remove affordance. */
  removeSymbol?: string;
  /** Symbol shown in the lead slot when the chip is selected. */
  selectedSymbol?: string;
}

/** The value a tag echoes back on `removed` / `activated`. */
export type UniTagValue = string | number | undefined;
