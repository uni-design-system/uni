import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../../../core';
import { Card } from '../../card';
import { Stack } from './stack.component';

const meta: Meta<typeof Stack> = {
  title: 'Components/Layout/Stack',
  component: Stack,
  tags: ['layout'],
  parameters: {
    docs: {
      description: {
        component:
          '`Stack` groups elements in a vertical arrangement with a uniform space between ' +
          'them. It is a `Box` with column presets, so every `Box` prop is available to it.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const StackedCards: Story = {
  args: { gap: 'lg' },
  render: (args) => (
    <Stack {...args}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Card key={n}>
          <Text>Card {n}</Text>
        </Card>
      ))}
    </Stack>
  ),
};
