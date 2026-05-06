import React, { CSSProperties, ReactNode } from 'react';
import { ContainerColorToken } from '@uni/core';
export interface ContainerProps {
    children: ReactNode;
    style: CSSProperties;
    colorToken?: ContainerColorToken;
}
export declare const ContainerContext: React.Context<{
    colorToken?: ContainerColorToken;
}>;
export default function Container({ children, style, colorToken, ...rest }: ContainerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=container.component.d.ts.map