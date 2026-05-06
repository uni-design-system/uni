import { jsx as _jsx } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef } from 'react';
import { getSlideTransition, TRANSITION_EASINGS, withDelay, cx, } from '../transition.utils';
const defaultTransition = {
    exit: {
        duration: 0.15,
        ease: TRANSITION_EASINGS.easeInOut,
    },
    enter: {
        type: 'spring',
        damping: 25,
        stiffness: 180,
    },
};
const variants = {
    exit: ({ direction, transition, transitionEnd, delay }) => {
        const { exit: exitStyles } = getSlideTransition({ direction });
        return {
            ...exitStyles,
            transition: transition?.exit ?? withDelay.exit(defaultTransition.exit, delay),
            transitionEnd: transitionEnd?.exit,
        };
    },
    enter: ({ direction, transitionEnd, transition, delay }) => {
        const { enter: enterStyles } = getSlideTransition({ direction });
        return {
            ...enterStyles,
            transition: transition?.enter ?? withDelay.enter(defaultTransition.enter, delay),
            transitionEnd: transitionEnd?.enter,
        };
    },
};
export const Slide = forwardRef(function Slide(props, ref) {
    const { direction = 'right', style, unmountOnExit, in: isOpen, className, transition, transitionEnd, delay, motionProps, ...rest } = props;
    const transitionStyles = getSlideTransition({ direction });
    const computedStyle = Object.assign({ position: 'fixed' }, transitionStyles.position, style);
    const show = unmountOnExit ? isOpen && unmountOnExit : true;
    const animate = isOpen || unmountOnExit ? 'enter' : 'exit';
    const custom = { transitionEnd, transition, direction, delay };
    return (_jsx(AnimatePresence, { custom: custom, children: show && (_jsx(motion.div, { ...rest, ref: ref, initial: "exit", className: cx('chakra-slide', className), animate: animate, exit: "exit", custom: custom, variants: variants, style: computedStyle, ...motionProps })) }));
});
Slide.displayName = 'Slide';
