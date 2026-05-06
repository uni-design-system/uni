import React, { ReactNode } from 'react';
import { Card } from '../card';
import { Overlay } from '../../core';
import { motion } from 'framer-motion';

type ModalSize = 'sm' | 'md' | 'lg';

const ModalSizes: Record<ModalSize, number> = {
  sm: 260,
  md: 320,
  lg: 500,
};

export interface ModalProps {
  size: ModalSize;
  children: ReactNode;
  isOpen: boolean;
}

export interface ModalOverlayProps {
  children?: React.ReactNode;
  fadeDuration?: number;
}

export const Modal = ({ children, isOpen, size = 'lg' }: ModalProps) => {
  return (
    <>
      <Overlay isOpen={isOpen}>
        <motion.div
          style={{ position: 'fixed' }}
          initial={{ y: 36, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 36, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card colorToken="background" width={ModalSizes[size]} cardType="elevated" elevation="modal">
            {children}
          </Card>
        </motion.div>
      </Overlay>
    </>
  );
};
