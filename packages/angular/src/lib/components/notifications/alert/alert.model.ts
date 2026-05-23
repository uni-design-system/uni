import type { Elevation, Radius, Variant } from '@uni-design-system/uni-core';

export interface UniAlertOptions {
  defaultVariant: Variant;
  borderRadius: Radius;
  transitionSpeed: number;
  topPosition: string | number;
  elevation: Elevation;
}
