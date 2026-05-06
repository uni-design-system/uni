import React, { ReactNode } from 'react';
type ModalSize = 'sm' | 'md' | 'lg';
export interface ModalProps {
    size: ModalSize;
    children: ReactNode;
    isOpen: boolean;
}
export interface ModalOverlayProps {
    children?: React.ReactNode;
    fadeDuration?: number;
}
export declare const Modal: ({ children, isOpen, size }: ModalProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=modal.component.d.ts.map