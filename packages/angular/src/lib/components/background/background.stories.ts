import { Meta, StoryObj } from '@storybook/angular';
import { UniBackgroundComponent } from './background.component';

const meta: Meta<UniBackgroundComponent> = {
  title: 'Components/Background',
  component: UniBackgroundComponent,
  argTypes: {
    image: {
      description: 'URL of the background image',
      control: 'text',
      type: { name: 'string' },
    },
    imagePosition: {
      description:
        'Position of the background image. Accepts any valid CSS background-position value',
      control: {
        type: 'select',
        labels: {
          custom: 'Enter custom value...',
        },
      },
      options: [
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top left',
        'top right',
        'bottom left',
        'bottom right',
        'center center',
        '25% 75%',
        'custom',
      ],
      mapping: {
        custom: '',
      },
    },
    imageSize: {
      description:
        'Size behavior of the background image. Accepts any valid CSS background-size value',
      control: {
        type: 'select',
        labels: {
          custom: 'Enter custom value...',
        },
      },
      options: ['cover', 'contain', 'auto', '100%', '50% auto', 'custom'],
      mapping: {
        custom: '',
      },
    },

    height: {
      description: 'Height of the background container',
      control: 'text',
      type: { name: 'union', value: [{ name: 'string' }, { name: 'number' }] },
    },
    width: {
      description: 'Width of the background container',
      control: 'text',
      type: { name: 'union', value: [{ name: 'string' }, { name: 'number' }] },
    },
  },
};

export default meta;

export const Primary: StoryObj<UniBackgroundComponent> = {
  args: {
    image: 'images/phone-zone-illustration.svg',
    imagePosition: 'center',
    imageSize: '400px',
    height: '400px',
    width: '100%',
  },
  parameters: {
    docs: {
      description: {
        story: `
The Background component is used to create containers with background images. It provides controls for image positioning and sizing.

## Features
- Supports any image URL
- Configurable image position and size
- Flexible height and width settings
- Non-repeating background images by default
`,
      },
    },
  },
};

export const ContainSize: StoryObj<UniBackgroundComponent> = {
  args: {
    ...Primary.args,
    imageSize: 'contain',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Using `contain` for imageSize preserves the image's aspect ratio while ensuring it fits within the container.",
      },
    },
  },
};

export const CustomPosition: StoryObj<UniBackgroundComponent> = {
  args: {
    ...Primary.args,
    imagePosition: 'top',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The image position can be controlled using standard CSS background-position values.',
      },
    },
  },
};
