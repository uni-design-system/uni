import { jsx as _jsx } from "react/jsx-runtime";
import { BoxShadow, Padding, useTheme } from '../../core';
import Container from '../../core/container/container.component';
export function Card({ children, cardType, elevation, colorToken = 'surface', width, height, borderRadius, style, ...rest }) {
    const { colors, containers } = useTheme();
    const { borderRadii } = containers.card;
    const styles = {
        height,
        width,
        backgroundColor: colors[colorToken || 'surface'],
        color: colors[`on-${colorToken}` || 'on-surface'],
        ...Padding('md', 'all'),
        ...style,
    };
    if (cardType === 'elevated') {
        styles.boxShadow = BoxShadow(elevation || 'raised');
    }
    if (borderRadii && borderRadius !== 'none') {
        styles.borderRadius = borderRadii[borderRadius || 'md'];
    }
    return (_jsx(Container, { colorToken: colorToken, style: styles, ...rest, children: children }));
}
