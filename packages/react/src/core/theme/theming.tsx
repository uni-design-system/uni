import React, { createContext, useContext, useMemo } from 'react';
import {LightTheme, type Theme} from "@uni-design-system/uni-core";

const defaultTheme = LightTheme;

const ThemeContext = createContext<Theme>(defaultTheme);

export const ThemeProvider: React.FC<{ theme?: Theme; children: React.ReactNode }> = ({ theme, children }) => {
  // Use useMemo to prevent unnecessary re-renders when the parent re-renders
  const value = useMemo(() => theme || defaultTheme, [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};


export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};


export function withTheme<P extends { theme: Theme }>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'theme'>> {
  return function WrappedComponent(props: any) {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
}
