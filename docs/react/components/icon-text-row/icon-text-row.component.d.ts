import { ReactNode } from '../../../../../node_modules/.pnpm/react@18.3.1/node_modules/react';
import { ContentColorToken, HorizontalAlign, TextRole } from '@uni-design-system/uni-core';
import { IconName } from '../../core/icon';
export interface IconTextRowProps {
    iconName: IconName;
    color: ContentColorToken;
    align?: HorizontalAlign;
    text?: string;
    textRole?: TextRole;
    children?: ReactNode;
}
export declare const IconTextRow: ({ iconName, color, align, text, textRole, children, }: IconTextRowProps) => JSX.Element;
//# sourceMappingURL=icon-text-row.component.d.ts.map