import { ReactNode } from 'react';
import { ContentColorToken, HorizontalAlign, TextRole } from '@uni/core';
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