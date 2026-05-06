import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getValue } from '@uni/core';
import { alignCenter, expand, fix, row, Text, Icon, useTheme } from '../../core';
export const IconTextRow = ({ iconName, color, align = 'left', text, textRole = 'title-medium', children, }) => {
    const theme = useTheme();
    const textProps = getValue(theme, `typography.${textRole}`, theme.typography['title-medium']);
    const textHeight = textProps.fontSize;
    const textLineHeight = textProps.lineHeight || textHeight;
    const textMargin = text || children ? textLineHeight - textHeight : 0;
    function RowIcon() {
        return (_jsx("div", { style: { ...fix, maxHeight: textLineHeight }, children: _jsx(Icon, { name: iconName, width: textLineHeight, height: textLineHeight, color: color }) }));
    }
    function RowText() {
        return (_jsx("div", { style: { ...expand, paddingLeft: textMargin, paddingRight: textMargin }, children: _jsx(Text, { align: align, colorToken: color, role: textRole, children: text || children }) }));
    }
    function RowCenter() {
        return align === 'center' ? _jsx("div", { style: { ...expand } }) : null;
    }
    return ['left', 'center'].includes(align) ? (_jsxs("div", { style: { ...row, ...alignCenter }, children: [_jsx(RowCenter, {}), _jsx(RowIcon, {}), _jsx(RowText, {}), _jsx(RowCenter, {})] })) : (_jsxs("div", { style: { ...row, ...alignCenter }, children: [_jsx(RowText, {}), _jsx(RowIcon, {})] }));
};
