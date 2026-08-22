import React, { forwardRef, type ElementType } from 'react';

import type { PolymorphicComponent } from '../../../core/polymorphic';
import { Box, type BoxOwnProps, type BoxProps } from '../box';

export type RowProps<E extends ElementType = 'div'> = BoxProps<E>;

/**
 * A horizontal Box: `display: flex` in a row.
 *
 * `minWidth` defaults to `fit-content` (guards content collapse). Set
 * `minWidth={0}` when the row must shrink inside a constrained flex parent
 * (scroll or text-truncation containment).
 */
export const Row = forwardRef<Element, BoxOwnProps>(function Row(props, ref) {
  return (
    <Box
      display="flex"
      flexDirection="row"
      minWidth="fit-content"
      {...(props as BoxProps)}
      ref={ref}
    />
  );
}) as PolymorphicComponent<BoxOwnProps>;

Row.displayName = 'Row';
