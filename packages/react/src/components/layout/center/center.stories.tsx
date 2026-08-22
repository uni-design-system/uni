import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../../../core';
import { Center } from './center.component';

const meta: Meta<typeof Center> = {
  title: 'Components/Layout/Center',
  component: Center,
  tags: ['layout'],
  parameters: {
    docs: {
      description: {
        component:
          '`Center` centers its content on both axes. It is a `Box` with centering presets, ' +
          'so every `Box` prop is available to it.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Center>;

export const Primary: Story = {
  args: { height: 180, width: '100%', color: 'surface-variant', borderRadius: 'md' },
  render: (args) => (
    <Center {...args}>
      <Text role="headline-large">Centered Content</Text>
    </Center>
  ),
};
