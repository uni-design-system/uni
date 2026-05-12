import { default as React, CSSProperties, ReactNode } from '../../../../../node_modules/.pnpm/react@18.3.1/node_modules/react';
import { ContainerColorToken } from '@uni-design-system/uni-core';
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