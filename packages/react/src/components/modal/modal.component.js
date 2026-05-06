import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Card } from '../card';
import { Overlay } from '../../core';
import { motion } from 'framer-motion';
const ModalSizes = {
    sm: 260,
    md: 320,
    lg: 500,
};
export const Modal = ({ children, isOpen, size = 'lg' }) => {
    return (_jsx(_Fragment, { children: _jsx(Overlay, { isOpen: isOpen, children: _jsx(motion.div, { style: { position: 'fixed' }, initial: { y: 36, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 36, opacity: 0 }, transition: { duration: 0.2 }, children: _jsx(Card, { colorToken: "background", width: ModalSizes[size], cardType: "elevated", elevation: "modal", children: children }) }) }) }));
};
