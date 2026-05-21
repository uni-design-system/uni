import type { Elevation, Radius, Variant } from '@uni-design-system/uni-core';

export interface UniCardOptions {
  defaultVariant: Variant;
  borderRadius: Radius;
  transitionSpeed: number;
  elevation?: Elevation;
}
