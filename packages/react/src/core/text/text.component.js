import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from 'react';
import { FontWeightMap, } from '@uni/core';
import { useTheme } from '../theme';
import { ContainerContext } from '../container';
export function Text(props) {
    const { text, children, align, role = 'body-1-long', colorToken: overridingColorToken } = props;
    const { colors, typography } = useTheme();
    const { colorToken: containerColorToken } = useContext(ContainerContext);
    const colorToken = containerColorToken ? `on-${containerColorToken}` : undefined;
    const { fontSize, letterSpacing, lineHeight, fontWeight, fontFamily, fontStyle, textTransform } = typography[role];
    const style = {
        color: colors[overridingColorToken || colorToken || 'on-surface'],
        fontSize: fontSize + 'px',
        letterSpacing,
        textAlign: align,
        textTransform,
        lineHeight: lineHeight + 'px',
        fontFamily,
        fontStyle,
        fontWeight: FontWeightMap[fontWeight],
    };
    return _jsx("div", { style: style, children: text || children });
}
