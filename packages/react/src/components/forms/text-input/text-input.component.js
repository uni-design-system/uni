import { jsx as _jsx } from "react/jsx-runtime";
export const TextInput = ({ value, onChange }) => {
    return (_jsx("div", { children: _jsx("input", { type: "text", value: value, onChange: onChange }) }));
};
