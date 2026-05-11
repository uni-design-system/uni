import React from 'react';
import { getDeviceOrientation, getDeviceSize, Layout } from '@uni-design-system/uni-core';
import LayoutContext from './layout.context';

export function useLayout(): Layout {
  const { height, width } = React.useContext(LayoutContext);
  const deviceSize = getDeviceSize(height, width);
  const orientation = getDeviceOrientation(height, width);

  return { orientation, deviceSize };
}
