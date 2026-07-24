import type { ColorKey, OptionalSize, Typeface } from '@uni-design-system/uni-core';

/** One step in the trail. The last item is treated as the current page. */
export interface BreadcrumbItem {
  label: string;
  /** Link target. Omit for SPA routing and handle `itemClicked` instead. */
  href?: string;
}

/** Theme-level options for `uni-breadcrumb`, resolved by token name. */
export interface UniBreadcrumbOptions {
  /** Trail typography token. */
  typeface?: Typeface;
  /** Link color for ancestor items. */
  color?: ColorKey;
  /** Color of the current (last) item. */
  currentColor?: ColorKey;
  /** Material symbol drawn between items. */
  separatorSymbol?: string;
  /** Space around separators, as a spacing token. */
  gap?: OptionalSize;
}
