import { default as React } from '../../../../../node_modules/.pnpm/react@18.3.1/node_modules/react';
import { UniTheme } from '@uni-design-system/uni-core';
export declare const ThemeProvider: React.FC<{
    theme?: UniTheme;
    children: React.ReactNode;
}>;
export declare const useTheme: () => UniTheme;
export declare function withTheme<P extends {
    theme: UniTheme;
}>(Component: React.ComponentType<P>): React.ComponentType<Omit<P, 'theme'>>;
//# sourceMappingURL=theming.d.ts.map