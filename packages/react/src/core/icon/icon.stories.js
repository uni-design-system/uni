import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Icon } from './icon.component';
import { Button } from '../../components';
import { IconKeys } from './index';
export default {
    title: 'Typography/Icons',
    component: Icon,
};
export const IconPlayground = (args) => _jsx(Icon, { ...args });
IconPlayground.args = {
    name: IconKeys[0],
    height: 48,
    width: 48,
};
export const IconManifest = () => {
    const [filteredIcons, setFilteredIcons] = useState(IconKeys);
    const Filter = (filter) => {
        return IconKeys.filter((name) => name.toLowerCase().indexOf(filter.toLowerCase()) > -1);
    };
    const copyToClipboard = async (iconName) => {
        await navigator.clipboard.writeText(iconName);
        alert(`Copied ${iconName} to clipboard.`);
    };
    return (_jsxs("div", { children: [_jsx("input", { onChange: (e) => setFilteredIcons(Filter(e.target.value)), placeholder: "Filter Icons by Name" }), _jsx("div", { children: filteredIcons.map((iconName) => {
                    return (_jsx(Button, { buttonType: "icon", iconName: iconName, onClick: () => copyToClipboard(iconName), children: iconName }));
                }) })] }));
};
