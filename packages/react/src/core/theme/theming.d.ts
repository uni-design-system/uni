import React from 'react';
import { type Theme } from "@uni/core";
export declare const ThemeProvider: React.FC<{
    theme?: Theme;
    children: React.ReactNode;
}>;
export declare const useTheme: () => Theme;
export declare function withTheme<P extends {
    theme: Theme;
}>(Component: React.ComponentType<P>): React.ComponentType<Omit<P, 'theme'>>;
//# sourceMappingURL=theming.d.ts.map