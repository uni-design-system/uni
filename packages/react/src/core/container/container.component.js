import { jsx as _jsx } from "react/jsx-runtime";
import { createContext } from 'react';
export const ContainerContext = createContext({});
export default function Container({ children, style, colorToken, ...rest }) {
    return (_jsx(ContainerContext.Provider, { value: { colorToken }, children: _jsx("div", { style: style, ...rest, children: children }) }));
}
