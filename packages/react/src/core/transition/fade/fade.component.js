import { jsx as _jsx } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef } from 'react';
import { TRANSITION_DEFAULTS, withDelay } from '../transition.utils';
const variants = {
    enter: ({ transition, transitionEnd, delay } = {}) => ({
        opacity: 1,
        transition: transition?.enter ?? withDelay.enter(TRANSITION_DEFAULTS.enter, delay),
        transitionEnd: transitionEnd?.enter,
    }),
    exit: ({ transition, transitionEnd, delay } = {}) => ({
        opacity: 0,
        transition: transition?.exit ?? withDelay.exit(TRANSITION_DEFAULTS.exit, delay),
        transitionEnd: transitionEnd?.exit,
    }),
};
export const fadeConfig = {
    initial: 'exit',
    animate: 'enter',
    exit: 'exit',
    variants: variants,
};
export const Fade = forwardRef(function Fade(props, ref) {
    const { unmountOnExit, in: isOpen, className, transition, transitionEnd, delay, ...rest } = props;
    const animate = isOpen || unmountOnExit ? 'enter' : 'exit';
    const show = unmountOnExit ? isOpen && unmountOnExit : true;
    const custom = { transition, transitionEnd, delay };
    return (_jsx(AnimatePresence, { custom: custom, children: show && _jsx(motion.div, { ref: ref, className: 'fade', custom: custom, ...fadeConfig, animate: animate, ...rest }) }));
});
Fade.displayName = 'Fade';
