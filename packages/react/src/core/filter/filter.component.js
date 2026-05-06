import { jsx as _jsx } from "react/jsx-runtime";
import Container from '../container/container.component';
import { FilterStyle } from './filter.style';
export const Filter = (filterProps) => {
    const { children } = filterProps;
    const style = FilterStyle(filterProps);
    return _jsx(Container, { style: style, children: children });
};
