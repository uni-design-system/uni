import React, { forwardRef, type ElementType } from 'react';

import type { PolymorphicComponent } from '../../../core/polymorphic';
import { Box, type BoxOwnProps, type BoxProps } from '../box';

export type StackProps<E extends ElementType = 'div'> = BoxProps<E>;

/**
 * A vertical Box: `display: flex` in a column.
 *
 * `minHeight` defaults to `fit-content` (guards content collapse). Set
 * `minHeight={0}` when the stack must shrink inside a constrained flex parent
 * (scroll containment).
 */
export const Stack = forwardRef<Element, BoxOwnProps>(function Stack(props, ref) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="fit-content"
      {...(props as BoxProps)}
      ref={ref}
    />
  );
}) as PolymorphicComponent<BoxOwnProps>;

Stack.displayName = 'Stack';
