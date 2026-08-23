import type { Elevation, Motion, Radius, Variant } from '@uni-design-system/uni-core';

export interface UniAlertOptions {
  defaultVariant: Variant;
  borderRadius: Radius;
  /** Named motion primitive for the enter/leave transition. Defaults to
      `notification`. */
  motion?: Motion;
  topPosition: string | number;
  elevation: Elevation;
}
