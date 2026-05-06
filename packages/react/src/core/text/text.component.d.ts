import { ReactNode } from 'react';
import { ContentColorToken, HorizontalAlign, Size, TextRole } from '@uni/core';
export interface TextProps {
    text?: string;
    children?: ReactNode;
    align?: HorizontalAlign;
    role?: TextRole;
    scale?: Size;
    colorToken?: ContentColorToken;
}
export declare function Text(props: TextProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=text.component.d.ts.map