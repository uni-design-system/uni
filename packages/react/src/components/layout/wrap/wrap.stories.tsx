import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../../../core';
import { Box } from '../box';
import { Wrap } from './wrap.component';

const meta: Meta<typeof Wrap> = {
  title: 'Components/Layout/Wrap',
  component: Wrap,
  tags: ['layout'],
  parameters: {
    docs: {
      description: {
        component:
          'Adds space between elements and wraps them onto the next line when there is not ' +
          'enough room. It is a `Box` with wrapping presets.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Wrap>;

export const Primary: Story = {
  args: { gap: 'sm', maxWidth: 420, padding: 'md', border: 'outline', borderRadius: 'md' },
  render: (args) => (
    <Wrap {...args}>
      {['Sofas', 'Lighting', 'Rugs', 'Case goods', 'Textiles', 'Art', 'Accessories'].map((tag) => (
        <Box key={tag} color="secondary-container" borderRadius="sm" padding="sm">
          <Text>{tag}</Text>
        </Box>
      ))}
    </Wrap>
  ),
};
