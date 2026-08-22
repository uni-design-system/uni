import React, { forwardRef, type ElementType } from 'react';

import type { PolymorphicComponent } from '../../../core/polymorphic';
import { Box, type BoxOwnProps, type BoxProps } from '../box';

export type CenterProps<E extends ElementType = 'div'> = BoxProps<E>;

/** A Box that centers its content on both axes. */
export const Center = forwardRef<Element, BoxOwnProps>(function Center(props, ref) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      {...(props as BoxProps)}
      ref={ref}
    />
  );
}) as PolymorphicComponent<BoxOwnProps>;

Center.displayName = 'Center';
