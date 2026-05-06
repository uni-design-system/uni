import React, { useState } from 'react';
import { Modal, ModalProps } from './modal.component';
import { Text } from '../../core';
import { Button } from '../button';
import { ModalCloseButton } from './modal-close-button.component';

export default {
  title: 'Components/Modal',
  component: Modal,
};

export const Basic = (args: ModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal {...args} isOpen={isOpen}>
        <ModalCloseButton onClick={() => setIsOpen(false)} />
        <Text role="body-1-short">This is a simple modal component.</Text>
      </Modal>
    </>
  );
};
