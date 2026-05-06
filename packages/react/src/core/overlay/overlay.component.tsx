import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OverlayStyle } from './overlay.config';
import { useTheme } from '../theme';
import { OverlayProps } from './overlay.model';

export const Overlay = (props: OverlayProps): JSX.Element => {
  const { isOpen, fadeDuration = 0.35 } = props;
  const theme = useTheme();
  const overlayStyle = OverlayStyle(theme, props);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeDuration }}
          style={overlayStyle}
        >
          {props.children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
