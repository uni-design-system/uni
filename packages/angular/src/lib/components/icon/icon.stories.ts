import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { UniIconComponent as Icon } from './icon.component';
import { BaseIcons } from '@uni-design-system/uni-core';
import type { ContainerColorToken } from '@uni-design-system/uni-core';
import { UniBoxDirective } from '../layout';

type StoryType = Icon & { containerSize?: number; containerColor?: ContainerColorToken };

const meta: Meta<StoryType> = {
  title: 'Components/Primitives/Icon',
  component: Icon,
  render: (args) => {
    const { name, color, size, containerSize } = args;
    return {
      undefined,
      template: `
          <div box-layout height="${containerSize}px">
            <uni-icon name="${name}" color="${color}" ${size ? `size="${size}"` : ''} />
          </div>
      `,
    };
  },
  decorators: [moduleMetadata({ imports: [UniBoxDirective] })],
  argTypes: {
    containerSize: {
      description: 'Size of the surrounding box. With no `size` set, the icon scales to fill it.',
      control: { type: 'range', min: 20, max: 56, step: 4 },
    },
    size: {
      description:
        'Explicit square size for the icon itself, overriding the container. Numbers are px; ' +
        'strings pass through (`1.25rem`). Leave empty to fill the container.',
      control: { type: 'text' },
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
      options: Object.keys(BaseIcons),
      control: { type: 'select' },
    },
    color: {
      description:
        'Statically sets the icon color. Use to ignore the __currentcolor__ of the container.',
    },
  },
  args: {
    containerSize: 48,
    containerColor: 'primary-container',
    name: 'checkCircle',
  },
};

export default meta;
type Story = StoryObj<StoryType>;

/** The default: no `size`, so the icon grows to whatever box holds it. */
export const Primary: Story = {
  args: {
    name: 'checkCircle',
  },
};

/**
 * With `size` set, the icon ignores the container box — useful at call sites
 * that would otherwise need a width/height rule just to size one glyph.
 */
export const ExplicitSize: Story = {
  args: {
    name: 'checkCircle',
    size: 20,
    containerSize: 48,
  },
};
