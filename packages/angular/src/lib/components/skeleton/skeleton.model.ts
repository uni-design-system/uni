import type { ColorKey, OptionalSize, Radius } from '@uni-design-system/uni-core';

/** Placeholder geometry: a text line block, a rectangle, or a circle. */
export type SkeletonShape = 'text' | 'rect' | 'circle';

/** Theme-level options for `uni-skeleton`, resolved by token name. */
export interface UniSkeletonOptions {
  /** Base placeholder color. */
  color?: ColorKey;
  /** Sweep highlight color for the shimmer. */
  highlightColor?: ColorKey;
  /** Corner radius token for text/rect shapes (circles are always round). */
  borderRadius?: Radius;
  /** 'shimmer' animates a highlight sweep; 'none' renders static blocks. */
  animation?: 'shimmer' | 'none';
  /** Shimmer sweep duration in seconds. */
  duration?: number;
  /** Vertical gap between text lines, as a spacing token. */
  gap?: OptionalSize;
}
