import type { Border, ContainerColorToken, Motion, Radius, Shadow, TextRole } from '@uni-design-system/uni-core';

export interface UniTooltipOptions {
  /** Named motion primitive for the fade in and out. Defaults to `notification`. */
  motion?: Motion;
  color?: ContainerColorToken;
  border?: Border;
  borderRadius?: Radius;
  shadow?: Shadow;
  typeface: TextRole;
}
