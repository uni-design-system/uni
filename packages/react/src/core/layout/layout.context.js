import React from 'react';
const LayoutContext = React.createContext({ height: 1000, width: 1000 });
if (process.env.NODE_ENV !== 'production') {
    LayoutContext.displayName = 'LayoutContext';
}
export default LayoutContext;
