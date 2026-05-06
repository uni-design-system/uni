import React, { CSSProperties, ReactNode } from 'react';
import { ButtonType, ContentColorToken } from '@uni/core';
import { IconName } from '../../core/icon';
export interface ButtonProps {
    text?: string;
    children?: ReactNode;
    buttonType?: ButtonType;
    active?: boolean;
    disabled?: boolean;
    iconName?: IconName;
    contentColor?: ContentColorToken;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disableRipple?: boolean;
    style?: CSSProperties;
}
export declare const Button: ({ text, children, buttonType, disabled, iconName, contentColor: overrideContentColor, onClick, disableRipple, style: userStyle, ...rest }: ButtonProps) => JSX.Element;
//# sourceMappingURL=button.component.d.ts.map