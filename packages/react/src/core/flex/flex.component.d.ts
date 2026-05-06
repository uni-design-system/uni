import React, { HTMLAttributes, ReactNode } from 'react';
import { AlignContent, FlexDirection, FlexGrow, FlexShrink, FlexWrap, JustifyContent } from '@uni/core';
import { Property } from 'csstype';
export interface FlexOptions extends HTMLAttributes<HTMLDivElement> {
    /**
     * Shorthand for `alignItems` style prop
     * @type AlignItems
     */
    align?: AlignContent;
    /**
     * Shorthand for `justifyContent` style prop
     * @type JustifyContent
     */
    justify?: JustifyContent;
    /**
     * Shorthand for `flexWrap` style prop
     * @type FlexWrap
     */
    wrap?: FlexWrap;
    /**
     * Shorthand for `flexDirection` style prop
     * @type FlexDirection
     * @default "row"
     */
    direction?: FlexDirection;
    /**
     * Shorthand for `flexBasis` style prop
     * @type number
     */
    basis?: number;
    /**
     * Shorthand for `flexGrow` style prop
     * @type FlexGrow
     */
    grow?: FlexGrow;
    /**
     * Shorthand for `flexShrink` style prop
     * @type FlexShrink
     */
    shrink?: FlexShrink;
    gap?: Property.Gap<number | string>;
}
export interface FlexProps extends FlexOptions {
    children: ReactNode;
}
/**
 * React component used to create flexbox layouts.
 *
 * It renders a `div` with `display: flex` and
 * comes with helpful style shorthand.
 *
 * @see Docs
 */
export declare const Flex: React.ForwardRefExoticComponent<FlexProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=flex.component.d.ts.map