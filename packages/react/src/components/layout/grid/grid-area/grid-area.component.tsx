import React, { forwardRef, type ElementType } from 'react';

import type { PolymorphicComponent } from '../../../../core/polymorphic';
import { Box, type BoxOwnProps, type BoxProps } from '../../box';

export interface GridAreaOwnProps extends BoxOwnProps {
  /** The named area of the parent Grid's `templateAreas` this fills. */
  area: string;
}

export type GridAreaProps<E extends ElementType = 'div'> = Omit<
  BoxProps<E>,
  keyof GridAreaOwnProps
> &
  GridAreaOwnProps;

/** Places its content in a named area of the surrounding {@link Grid}. */
export const GridArea = forwardRef<Element, GridAreaOwnProps>(function GridArea(props, ref) {
  const { area, ...boxProps } = props as GridAreaOwnProps;

  return <Box gridArea={area} {...(boxProps as BoxProps)} ref={ref} />;
}) as PolymorphicComponent<GridAreaOwnProps>;

GridArea.displayName = 'GridArea';
