import { ReactNode } from '../../../../../node_modules/.pnpm/react@18.3.1/node_modules/react';
import { ContentColorToken, HorizontalAlign, Size, TextRole } from '@uni-design-system/uni-core';
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