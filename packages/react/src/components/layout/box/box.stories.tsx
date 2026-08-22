import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../../../core';
import { Box } from './box.component';

const meta: Meta<typeof Box> = {
  title: 'Components/Layout/Box',
  component: Box,
  tags: ['layout'],
  parameters: {
    docs: {
      description: {
        component:
          'Box is the base layout component. It is highly configurable, and every other ' +
          'layout component is a Box with presets. Render it as any element with `as` so ' +
          'the semantics stay yours: `<Box as="main" padding="md">`.',
      },
    },
  },
  render: ({ children, ...args }) => (
    <Box {...args}>
      <Text>{children as React.ReactNode}</Text>
    </Box>
  ),
  argTypes: {
    // Styling
    color: { description: "Sets the background color of the box using the theme's color tokens." },
    shadow: {
      description: "Applies a box shadow based on the theme's elevation levels.",
      control: { type: 'select' },
      options: ['raised', 'menu', 'dialog', 'warn'],
    },
    elevation: {
      description: 'Deprecated alias for `shadow`.',
      control: { type: 'select' },
      options: ['raised', 'menu', 'dialog', 'warn'],
    },
    textAlign: { description: 'Controls the text alignment within the box.' },

    // Dimensions
    height: {
      description:
        "Sets the height of the box. A number is pixels; a string is a CSS length ('100%').",
    },
    minHeight: { description: 'Sets the minimum height of the box.' },
    maxHeight: { description: 'Sets the maximum height of the box.' },
    width: {
      description:
        "Sets the width of the box. A number is pixels; a string is a CSS length ('100%').",
    },
    minWidth: { description: 'Sets the minimum width of the box.' },
    maxWidth: { description: 'Sets the maximum width of the box.' },
    fullWidth: { description: 'When true, sets the width to 100%.' },
    fullHeight: { description: 'When true, sets the height to 100%.' },

    // Padding
    padding: { description: 'Sets padding on all sides of the box.' },
    paddingHorizontal: { description: 'Sets padding on the left and right sides.' },
    paddingVertical: { description: 'Sets padding on the top and bottom sides.' },
    paddingLeft: { description: 'Sets padding on the left side.' },
    paddingRight: { description: 'Sets padding on the right side.' },
    paddingTop: { description: 'Sets padding on the top side.' },
    paddingBottom: { description: 'Sets padding on the bottom side.' },

    // Border
    border: { description: 'Applies a theme-defined border on all sides.' },
    dashBorder: { description: 'When true, applies a dashed border style.' },
    borderTop: { description: 'Applies a theme-defined border to the top side.' },
    borderBottom: { description: 'Applies a theme-defined border to the bottom side.' },
    borderLeft: { description: 'Applies a theme-defined border to the left side.' },
    borderRight: { description: 'Applies a theme-defined border to the right side.' },

    // Border radius
    borderRadius: { description: 'Sets the border radius on all corners.' },
    borderRadiusLeft: { description: 'Sets the border radius on the left corners.' },
    borderRadiusRight: { description: 'Sets the border radius on the right corners.' },
    borderRadiusTop: { description: 'Sets the border radius on the top corners.' },
    borderRadiusBottom: { description: 'Sets the border radius on the bottom corners.' },

    // Flex layout
    display: { description: 'Sets the display property (flex, block, etc.).' },
    flexDirection: { description: 'Sets the direction of flex items.' },
    alignSelf: { description: 'Controls how the box aligns itself within its container.' },
    alignItems: { description: 'Controls how items are aligned within the box.' },
    alignContent: {
      description: "Controls alignment of lines when there's extra space in the cross-axis.",
    },
    justifyContent: { description: 'Controls alignment of items along the main axis.' },
    grow: {
      description:
        'Sets the flex grow factor, determining how much the box will grow relative to other flex items.',
    },
    wrapItems: { description: 'Controls whether flex items wrap onto multiple lines.' },
    gap: { description: 'Sets the gap between flex or grid items.' },

    // Grid layout
    gridArea: { description: 'Specifies the grid area the box should occupy.' },
    gridColumn: { description: 'Specifies which column(s) the box should occupy.' },
    gridRow: { description: 'Specifies which row(s) the box should occupy.' },

    // Other
    as: { description: 'The element to render. Defaults to `div`.' },
    overflow: { description: 'Controls how content that overflows the box is handled.' },
    ignoreDir: {
      description: 'When true (default), automatically reverses flex direction in RTL mode.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Primary: Story = {
  args: {
    color: 'secondary-container',
    borderRadius: 'md',
    padding: 'lg',
    children: 'Box Content.',
  },
};

/** A flex container: three items spread along the main axis. */
export const FlexContainer: Story = {
  args: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'md',
    padding: 'md',
    border: 'outline',
    borderRadius: 'md',
  },
  render: (args) => (
    <Box {...args}>
      <Text>Item 1</Text>
      <Text>Item 2</Text>
      <Text>Item 3</Text>
    </Box>
  ),
};

/** `as` keeps the semantics yours — this one renders a `<main>` element. */
export const SemanticElement: Story = {
  args: {
    as: 'main',
    color: 'tertiary-container',
    padding: 'lg',
    borderRadius: 'lg',
    children: 'Rendered as <main>.',
  },
};
