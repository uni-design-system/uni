import { Meta, StoryObj } from '@storybook/angular';

import { UniIconComponent as Icon } from './icon.component';
import { icons } from './icon.record';
import type { ContainerColorToken } from '@uni-design-system/uni-core';

type StoryType = Icon & { size?: number; containerColor?: ContainerColorToken };

const meta: Meta<StoryType> = {
  title: 'Components/Icon',
  component: Icon,
  render: (args) => {
    const { name, color, size, containerColor } = args;
    return {
      undefined,
      template: `
          <div style="height: ${size + 'px'}">
            <Icon name="${name}" color="${color}" />
          </div>
      `,
    };
  },
  argTypes: {
    size: {
      description: 'Adjust the size of the container to se how the icon will scale.',
      control: { type: 'range', min: 20, max: 56, step: 4 },
    },
    containerColor: {
      description:
        'Change the container color to show how the icon colors will adapt when used on different backgrounds.',
      options: [
        'primary',
        'primary-surface',
        'primary-container',
        'secondary-container',
        'tertiary-container',
      ],
      control: { type: 'select' },
    },
    name: {
      description: 'The name of the icon to display.',
      options: Object.keys(icons),
      control: { type: 'select' },
    },
    color: {
      description:
        'Statically sets the icon color. Use to ignore the __currentcolor__ of the container.',
    },
  },
  args: {
    size: 48,
    containerColor: 'primary-container',
    name: 'checkCircle',
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    name: 'checkCircle',
  },
};
