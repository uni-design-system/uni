import { ShadowElevation, ShadowCssMap } from '@uni/core';

export function BoxShadow(elevation: ShadowElevation) {
  return ShadowCssMap[elevation];
}
