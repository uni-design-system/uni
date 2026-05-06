import { jsx as _jsx } from "react/jsx-runtime";
import { Switch } from './switch.component';
export default {
    title: 'Components / Switch',
    component: Switch,
    argTypes: {
        size: {},
    },
};
export const SwitchPlayground = ({ ...props }) => _jsx(Switch, { ...props });
