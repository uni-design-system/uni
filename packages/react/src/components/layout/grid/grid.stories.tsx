import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../../../core';
import { GridArea } from './grid-area';
import { Grid } from './grid.component';

const meta: Meta<typeof Grid> = {
  title: 'Components/Layout/Grid',
  component: Grid,
  tags: ['layout'],
  parameters: {
    docs: {
      description: {
        component:
          'Grid composes elements in a grid-like pattern. Like tables, grids align elements ' +
          'into columns and rows — but they allow far more control when spanning elements ' +
          'across them. Pair it with `GridArea` to place children by name.',
      },
    },
  },
  argTypes: {
    templateAreas: { description: 'Sets `grid-template-areas`.' },
    templateColumns: { description: 'Sets `grid-template-columns`.' },
    templateRows: { description: 'Sets `grid-template-rows`.' },
    outline: { description: 'Draws grid rules by opening the gap to a theme thickness.' },
    outlineColor: { description: 'The color those grid rules are drawn in.' },
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

const cells = [
  { area: 'nav', color: 'tertiary-container' },
  { area: 'a1', color: 'primary-container' },
  { area: 'a2', color: 'secondary-container' },
  { area: 'b1', color: 'tertiary-container' },
  { area: 'b2', color: 'error-container' },
] as const;

export const SimpleGrid: Story = {
  args: {
    templateAreas: `'nav a1 a2' 'nav b1 b2'`,
    gap: 'sm',
  },
  render: (args) => (
    <Grid {...args}>
      {cells.map(({ area, color }) => (
        <GridArea key={area} area={area} color={color} padding="md" borderRadius="sm">
          <Text>{area}</Text>
        </GridArea>
      ))}
    </Grid>
  ),
};
