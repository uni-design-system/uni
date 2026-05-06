import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useMemo } from 'react';
import { LightTheme } from "@uni/core";
const defaultTheme = LightTheme;
const ThemeContext = createContext(defaultTheme);
export const ThemeProvider = ({ theme, children }) => {
    // Use useMemo to prevent unnecessary re-renders when the parent re-renders
    const value = useMemo(() => theme || defaultTheme, [theme]);
    return _jsx(ThemeContext.Provider, { value: value, children: children });
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error("useTheme must be used within ThemeProvider");
    return context;
};
export function withTheme(Component) {
    return function WrappedComponent(props) {
        const theme = useTheme();
        return _jsx(Component, { ...props, theme: theme });
    };
}
