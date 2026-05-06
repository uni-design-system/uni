import React from 'react';
import { getDeviceOrientation, getDeviceSize } from '@uni/core';
import LayoutContext from './layout.context';
export function useLayout() {
    const { height, width } = React.useContext(LayoutContext);
    const deviceSize = getDeviceSize(height, width);
    const orientation = getDeviceOrientation(height, width);
    return { orientation, deviceSize };
}
