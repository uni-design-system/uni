import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HSLAToString, RGBToHSL } from '@uni/core';
import { BoxShadow, Padding, Text, useTheme } from '../../core';
export function ColorSwatch({ rgba, children, cardType = 'elevated', elevation, width, height }) {
    const theme = useTheme();
    const { borderRadii } = theme.containers.card;
    const cardStyle = {
        height,
        width,
        display: 'inline-block',
        backgroundColor: theme.colors['background'],
        color: theme.colors['on-background'],
        borderRadius: borderRadii?.sm,
        ...Padding('xs', 'all'),
        margin: 8,
    };
    if (cardType === 'elevated') {
        cardStyle.boxShadow = BoxShadow(elevation || 'pressed');
    }
    const hsla = RGBToHSL(rgba);
    const HSLColor = HSLAToString({
        hue: Math.round(hsla.hue || 0),
        saturation: Math.round(hsla.hue || 0),
        lightness: Math.round(hsla.lightness || 0),
    });
    const swatchColor = `rgb(${rgba.red}, ${rgba.green}, ${rgba.blue})`;
    const swatchStyle = {
        backgroundColor: swatchColor,
        height: 200,
        width: 200,
        display: 'inline-block',
        borderRadius: borderRadii?.xs,
    };
    return (_jsxs("div", { style: cardStyle, children: [_jsx("div", { style: swatchStyle }), _jsx(Text, { role: "headline-medium", children: children }), _jsx(Text, { role: "title-small", children: swatchColor }), _jsx(Text, { role: "title-small", children: HSLColor })] }));
}
