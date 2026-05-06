import { jsx as _jsx } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { OverlayStyle } from './overlay.config';
import { useTheme } from '../theme';
export const Overlay = (props) => {
    const { isOpen, fadeDuration = 0.35 } = props;
    const theme = useTheme();
    const overlayStyle = OverlayStyle(theme, props);
    return (_jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: fadeDuration }, style: overlayStyle, children: props.children })) }));
};
