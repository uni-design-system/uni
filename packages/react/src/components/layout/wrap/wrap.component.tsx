import React, { forwardRef, type ElementType } from 'react';

import type { PolymorphicComponent } from '../../../core/polymorphic';
import { Box, type BoxOwnProps, type BoxProps } from '../box';

export type WrapProps<E extends ElementType = 'div'> = BoxProps<E>;

/** A flex Box whose items wrap onto as many lines as they need. */
export const Wrap = forwardRef<Element, BoxOwnProps>(function Wrap(props, ref) {
  return <Box display="flex" wrapItems="wrap" {...(props as BoxProps)} ref={ref} />;
}) as PolymorphicComponent<BoxOwnProps>;

Wrap.displayName = 'Wrap';
