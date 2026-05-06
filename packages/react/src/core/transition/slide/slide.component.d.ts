import React from 'react';
import { HTMLMotionProps } from 'framer-motion';
import { SlideDirection, WithTransitionConfig } from '../transition.utils';
export type { SlideDirection };
export interface SlideOptions {
    /**
     * The direction to slide from
     * @default "right"
     */
    direction?: SlideDirection;
}
export interface SlideProps extends WithTransitionConfig<HTMLMotionProps<'div'>>, SlideOptions {
    motionProps?: HTMLMotionProps<'div'>;
}
export declare const Slide: React.ForwardRefExoticComponent<Omit<SlideProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=slide.component.d.ts.map