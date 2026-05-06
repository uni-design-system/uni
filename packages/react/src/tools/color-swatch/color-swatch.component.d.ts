import { ReactNode } from 'react';
import { RGB, ShadowElevation } from '@uni/core';
export type CardType = 'elevated' | 'filled' | 'outlined';
export interface ColorSwatchProps {
    rgba: RGB;
    children?: ReactNode;
    cardType?: CardType;
    elevation?: ShadowElevation;
    width?: string | number;
    height?: string | number;
}
export declare function ColorSwatch({ rgba, children, cardType, elevation, width, height }: ColorSwatchProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=color-swatch.component.d.ts.map