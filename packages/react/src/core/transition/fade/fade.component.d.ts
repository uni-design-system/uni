import React from 'react';
import { HTMLMotionProps } from 'framer-motion';
import { WithTransitionConfig } from '../transition.utils';
export interface FadeProps extends WithTransitionConfig<HTMLMotionProps<'div'>> {
}
export declare const fadeConfig: HTMLMotionProps<'div'>;
export declare const Fade: React.ForwardRefExoticComponent<Omit<FadeProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=fade.component.d.ts.map