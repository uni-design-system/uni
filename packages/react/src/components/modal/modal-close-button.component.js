import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from '../button';
export const ModalCloseButton = ({ ...rest }) => {
    const style = {
        position: 'absolute',
        top: '8px',
        right: '8px',
        padding: '8px',
    };
    return _jsx(Button, { buttonType: "icon", iconName: "xmarkSolid", style: style, ...rest });
};
