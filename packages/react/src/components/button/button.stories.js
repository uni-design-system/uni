import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from './button.component';
export default {
    title: 'Components/Buttons',
    component: Button,
};
export const Filled = (args) => _jsx(Button, { ...args });
Filled.args = {
    disabled: false,
    buttonType: 'filled',
    text: 'Filled Button',
};
Filled.story = {
    name: 'Filled Button',
};
export const FilledSecondary = (args) => _jsx(Button, { ...args });
FilledSecondary.args = {
    disabled: false,
    buttonType: 'filled-secondary',
    text: 'Secondary Button',
};
FilledSecondary.story = {
    name: 'Secondary Filled Button',
};
export const Elevated = (args) => _jsx(Button, { ...args });
Elevated.args = {
    disabled: false,
    buttonType: 'elevated',
    text: 'Elevated Button',
};
Elevated.story = {
    name: 'Elevated Button',
};
export const DisabledElevated = (args) => _jsx(Button, { ...args });
DisabledElevated.args = {
    disabled: true,
    buttonType: 'elevated',
    text: 'Elevated Button',
};
DisabledElevated.story = {
    name: 'Disabled Elevated Button',
};
export const Outlined = (args) => _jsx(Button, { ...args });
Outlined.args = {
    disabled: false,
    buttonType: 'outlined',
    text: 'Outlined Button',
};
Outlined.story = {
    name: 'Outlined Button',
};
export const DisabledOutlined = (args) => _jsx(Button, { ...args });
DisabledOutlined.args = {
    disabled: true,
    buttonType: 'outlined',
    text: 'Outlined Button',
};
DisabledOutlined.story = {
    name: 'Disabled Outlined Button',
};
