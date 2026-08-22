import React, { forwardRef, type ElementType } from 'react';
import { css, cx } from '@emotion/css';

import type { Thickness, Variant } from '@uni-design-system/uni-core';

import { useThemeStyles } from '../../../core/theme';
import type { PolymorphicComponent } from '../../../core/polymorphic';
import { Box, type BoxOwnProps, type BoxProps } from '../box';

export interface GridOwnProps extends BoxOwnProps {
  /** `grid-template-areas`, e.g. `"'header header' 'nav main'"`. */
  templateAreas?: string;
  /** `grid-template-columns`, e.g. `"repeat(3, 1fr)"`. */
  templateColumns?: string;
  /** `grid-template-rows`, e.g. `"auto 1fr auto"`. */
  templateRows?: string;
  /** Draws grid lines: sets the gap to a theme thickness so the grid's own background shows through. */
  outline?: Thickness;
  /** The color those grid lines are drawn in — painted as the grid's background. */
  outlineColor?: Variant;
}

export type GridProps<E extends ElementType = 'div'> = Omit<BoxProps<E>, keyof GridOwnProps> &
  GridOwnProps;

/**
 * A Box laid out as a CSS grid. Beyond the Box props it takes the three
 * `template*` tracks, plus `outline`/`outlineColor` — a themed gap that reads
 * as grid rules rather than empty space.
 */
export const Grid = forwardRef<Element, GridOwnProps>(function Grid(props, ref) {
  const {
    templateAreas,
    templateColumns,
    templateRows,
    outline,
    outlineColor,
    className,
    ...boxProps
  } = props as GridOwnProps;
  const styles = useThemeStyles();

  const gridClass = css([
    templateAreas && { gridTemplateAreas: templateAreas },
    templateColumns && { gridTemplateColumns: templateColumns },
    templateRows && { gridTemplateRows: templateRows },
    outline && { gap: styles.getThickness(outline) },
    outlineColor && { backgroundColor: styles.colorPalette()[outlineColor] },
  ]);

  return (
    <Box
      display="grid"
      {...(boxProps as BoxProps)}
      className={cx(gridClass, className)}
      ref={ref}
    />
  );
}) as PolymorphicComponent<GridOwnProps>;

Grid.displayName = 'Grid';
