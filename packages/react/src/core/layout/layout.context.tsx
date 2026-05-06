import React from 'react';

interface ScreenSize {
  height: number;
  width: number;
}

const LayoutContext = React.createContext<ScreenSize>({ height: 1000, width: 1000 });

if (process.env.NODE_ENV !== 'production') {
  LayoutContext.displayName = 'LayoutContext';
}

export default LayoutContext;
