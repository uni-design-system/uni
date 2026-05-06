import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Modal } from './modal.component';
import { Text } from '../../core';
import { Button } from '../button';
import { ModalCloseButton } from './modal-close-button.component';
export default {
    title: 'Components/Modal',
    component: Modal,
};
export const Basic = (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: () => setIsOpen(true), children: "Open Modal" }), _jsxs(Modal, { ...args, isOpen: isOpen, children: [_jsx(ModalCloseButton, { onClick: () => setIsOpen(false) }), _jsx(Text, { role: "body-1-short", children: "This is a simple modal component." })] })] }));
};
