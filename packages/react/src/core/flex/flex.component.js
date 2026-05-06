import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
/**
 * React component used to create flexbox layouts.
 *
 * It renders a `div` with `display: flex` and
 * comes with helpful style shorthand.
 *
 * @see Docs
 */
export const Flex = forwardRef((props, ref) => {
    const { direction, align, justify, wrap, basis, grow, shrink, gap, style, ...rest } = props;
    const styles = {
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
        flexBasis: basis,
        flexGrow: grow,
        flexShrink: shrink,
        gap,
        ...style,
    };
    return _jsx("div", { ref: ref, style: styles, ...rest });
});
Flex.displayName = 'Flex';
