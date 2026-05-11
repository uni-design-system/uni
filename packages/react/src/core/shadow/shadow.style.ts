import { ShadowElevation, ShadowCssMap } from '@uni-design-system/uni-core';

export function BoxShadow(elevation: ShadowElevation) {
  return ShadowCssMap[elevation];
}
