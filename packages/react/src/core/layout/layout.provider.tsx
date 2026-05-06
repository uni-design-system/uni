import React from 'react';
import LayoutContext from './layout.context';

// @ts-ignore
export const LayoutProvider = ({children}) => {

  const getWidth = () => document.documentElement.clientWidth;
  const getHeight = () => document.documentElement.clientHeight;

  const [width, setWidth] = React.useState(getWidth);
  const [height, setHeight] = React.useState(getHeight);

  const handleWindowResize = () => {
    setWidth(getWidth);
    setHeight(getHeight);
  };

  React.useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return (
    <LayoutContext.Provider value={{ height, width }}>
      { children }
    </LayoutContext.Provider>
  )
}
