import { default as React } from '../../../../../../node_modules/.pnpm/react@18.3.1/node_modules/react';
import { HTMLMotionProps } from 'framer-motion';
import { WithTransitionConfig } from '../transition.utils';
export interface CollapseOptions {
    /**
     * If `true`, the opacity of the content will be animated
     * @default true
     */
    animateOpacity?: boolean;
    /**
     * The height you want the content in its collapsed state.
     * @default 0
     */
    startingHeight?: number | string;
    /**
     * The height you want the content in its expanded state.
     * @default "auto"
     */
    endingHeight?: number | string;
}
export type ICollapse = CollapseProps;
export interface CollapseProps extends WithTransitionConfig<HTMLMotionProps<'div'>>, CollapseOptions {
}
export declare const Collapse: React.ForwardRefExoticComponent<Omit<CollapseProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=collapse.component.d.ts.map