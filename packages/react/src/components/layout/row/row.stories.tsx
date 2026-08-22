import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../button';
import { Row } from './row.component';

const meta: Meta<typeof Row> = {
  title: 'Components/Layout/Row',
  component: Row,
  tags: ['layout'],
  parameters: {
    docs: {
      description: {
        component:
          '`Row` groups elements in a horizontal arrangement with a uniform space between ' +
          'them. It is a `Box` with row presets, so every `Box` prop is available to it.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Row>;

export const ButtonRow: Story = {
  args: { gap: 'lg' },
  render: (args) => (
    <Row {...args}>
      <Button buttonType="text" text="Button 1" />
      <Button buttonType="text" text="Button 2" />
      <Button buttonType="text" text="Button 3" />
    </Row>
  ),
};
