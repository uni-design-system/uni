import { ReactNode } from '../../../../../node_modules/.pnpm/react@18.3.1/node_modules/react';
import { Property } from 'csstype';
export interface GrainyGradientProps {
    children?: ReactNode;
    noiseFrequency?: number;
    noiseOctaves?: number;
    size?: number;
    minHeight?: Property.MinHeight;
    angle?: number;
    gradientColor?: Property.Color;
    backgroundColor?: Property.Color;
}
export declare const GrainyGradientBackground: ({ children, noiseFrequency, noiseOctaves, minHeight, size, angle, gradientColor, backgroundColor, }: GrainyGradientProps) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=grainy-gradient-background.component.d.ts.map