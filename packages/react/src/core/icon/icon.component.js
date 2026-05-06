import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useTheme } from '../theme';
import { IconDictionary } from "@uni-design-system/uni-react-icons/dist/cjs/src";
export function Icon({ name, color = 'on-surface', height = 24, width = 24 }) {
    if (!name)
        return _jsx(_Fragment, {});
    const { colors } = useTheme();
    const Icon = IconDictionary[name];
    return _jsx(Icon, { width: width, height: height, color: colors[color] });
}
