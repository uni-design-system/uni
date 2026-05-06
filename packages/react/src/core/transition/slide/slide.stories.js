import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useToggle } from '../../hooks';
import { Slide } from './slide.component';
import { Button, Card } from '../../../components';
export default {
    title: 'Components / Transition / Slide',
    component: Slide,
};
export const Sidebar = ({ ...args }) => {
    const [open, { toggle }] = useToggle(false);
    return (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: toggle, children: "Toggle Sidebar" }), _jsx(Slide, { style: {
                    maxWidth: 400,
                    padding: 0,
                }, in: open, ...args, children: _jsx(Card, { colorToken: "background", borderRadius: "none", cardType: open ? 'elevated' : undefined, elevation: "modal", height: "100%", children: _jsx(Button, { buttonType: "icon", iconName: "xmarkSolid", onClick: toggle }) }) })] }));
};
Sidebar.args = {};
