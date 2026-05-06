import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { BoxShadow, Text, useLayout, useTheme } from '../../core';
import { IconTextRow } from '../icon-text-row';
import { useRipple } from 'use-ripple-hook';
export const Button = ({ text, children, buttonType = 'filled', disabled = false, iconName, contentColor: overrideContentColor, onClick, disableRipple = false, style: userStyle, ...rest }) => {
    const { deviceSize } = useLayout();
    const theme = useTheme();
    const [ref, createRipple] = useRipple({ disabled: disableRipple || buttonType === 'elevated' });
    const buttonProps = theme.buttons[buttonType];
    const getOnColorToken = (color) => `on-${color}`;
    const contentColor = overrideContentColor || getOnColorToken(buttonProps.color);
    const [hover, setHover] = useState(false);
    const [click, setClick] = useState(false);
    const style = Style(theme, buttonType, deviceSize, hover, disabled, click);
    useEffect(() => {
        setTimeout(() => {
            setClick(false);
        }, 250);
    }, [click]);
    const handleClick = (event) => {
        setClick(true);
        onClick && onClick(event);
    };
    return (_jsx("button", { onMouseDown: createRipple, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), onClick: handleClick, disabled: disabled, style: { ...style, ...userStyle }, ref: ref, ...rest, children: iconName ? (_jsx(IconTextRow, { iconName: iconName, color: contentColor, textRole: "button", children: text || children })) : (_jsx(Text, { align: "center", role: "button", colorToken: contentColor, children: text || children })) }));
};
function Style(theme, buttonType, size = 'md', hover, disabled, click) {
    const { color, horizontalPadding, verticalPadding, borderColor, borderWidth, borderRadius, contentColor } = theme.buttons[buttonType];
    const styles = {
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
        cursor: 'pointer',
        paddingTop: verticalPadding[size] + 'px',
        paddingBottom: verticalPadding[size] + 'px',
        paddingLeft: horizontalPadding[size] + 'px',
        paddingRight: horizontalPadding[size] + 'px',
        borderRadius: borderRadius + 'px',
        backgroundColor: theme.colors[color],
        borderColor: theme.colors[borderColor],
        borderWidth: borderWidth + 'px',
        borderStyle: buttonType === 'outlined' ? 'solid' : 'none',
    };
    if (buttonType === 'elevated' && !disabled) {
        styles.boxShadow = BoxShadow(hover ? 'focussed' : 'raised');
    }
    if (disabled && buttonType === 'elevated') {
        styles.boxShadow = BoxShadow('pressed');
        styles.color = theme.colors[contentColor];
    }
    if (disabled) {
        styles.cursor = 'not-allowed';
    }
    if (click && buttonType === 'elevated' && !disabled) {
        styles.boxShadow = BoxShadow('pressed');
    }
    return styles;
}
