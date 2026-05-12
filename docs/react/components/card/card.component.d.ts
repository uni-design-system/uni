import { HTMLAttributes, ReactNode } from '../../../../../node_modules/.pnpm/react@18.3.1/node_modules/react';
import { ContainerColorToken, ShadowElevation, Size } from '@uni-design-system/uni-core';
import { Property } from 'csstype';
export type CardType = 'elevated' | 'filled' | 'outlined';
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    cardType?: CardType;
    colorToken?: ContainerColorToken;
    elevation?: ShadowElevation;
    width?: Property.Width<number | string>;
    height?: Property.Height<number | string>;
    borderRadius?: Size | 'none';
}
export declare function Card({ children, cardType, elevation, colorToken, width, height, borderRadius, style, ...rest }: CardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=card.component.d.ts.map