import { getValue } from '@uni/core';
export function BorderStyle(border, theme) {
    if (!border)
        return {};
    const borderTopColor = extractColor(theme, border, 'colorTop');
    const borderBottomColor = extractColor(theme, border, 'colorBottom');
    const borderLeftColor = extractColor(theme, border, 'colorLeft');
    const borderRightColor = extractColor(theme, border, 'colorRight');
    const borderTopWidth = getValue(border, 'widthTop', 'width');
    const borderBottomWidth = getValue(border, 'widthBottom', 'width');
    const borderLeftWidth = getValue(border, 'widthLeft', 'width');
    const borderRightWidth = getValue(border, 'widthRight', 'width');
    return {
        borderTopColor,
        borderBottomColor,
        borderLeftColor,
        borderRightColor,
        borderTopWidth,
        borderBottomWidth,
        borderLeftWidth,
        borderRightWidth,
    };
}
function extractColor(theme, border, key) {
    return theme.colors[getValue(border, key, 'color')];
}
