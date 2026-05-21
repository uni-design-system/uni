import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniButtonComponent as Button } from './button.component';

type StoryType = Button & { ngContent?: string };

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<StoryType> = {
  title: 'Components/Button',
  component: Button,

  decorators: [],
  render: (args) => {
    const { ngContent, variant, size, ...props } = args;
    return {
      props: {
        ...props,
        ngContent,
        variant,
        size,
      },
      template: `
        <button text-button [variant]="variant" [size]="size" ${argsToTemplate(props)}>
          {{ngContent}}
        </button>
      `,
    };
  },
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'warn', 'ghost'],
      description:
        'The color and style of the button as defined by the loaded theme. Controls the visual emphasis of the button. Default: "primary"',
      table: {
        category: 'Appearance',
        type: {
          summary: '"primary" | "secondary" | "tertiary" | "warn" | "ghost"',
        },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      defaultValue: 'lg',
      options: ['sm', 'md', 'lg', 'xl'],
      control: { type: 'radio' },
      description:
        'The size of the button as defined by the loaded theme. Controls the button dimensions and padding. Default: "lg"',
      table: {
        category: 'Appearance',
        type: { summary: '"sm" | "md" | "lg" | "xl"' },
        defaultValue: { summary: 'lg' },
      },
    },

    // Content
    ngContent: {
      description:
        'The inner text of the button component. This is the primary label displayed on the button.',
      control: 'text',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    symbolLeft: {
      description:
        'The Material Symbol name for an icon positioned to the left of the button text. There are over 3k symbols available. Use the official Material Symbol manifest to find the appropriate symbol name. Examples: `settings`, `home`, `done`, `add`, `logout`',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    symbolRight: {
      description:
        'The Material Symbol name for an icon positioned to the right of the button text. See `symbolLeft` for additional details.',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },

    // Behavior
    loading: {
      control: 'boolean',
      description:
        'When true, disables the button and displays a loading animation. Use this to prevent repetitive clicks during async operations. Default: false',
      table: {
        category: 'Behavior',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },

    // Note: Events like 'click' are handled automatically by Storybook for standard elements
  },
};

export default meta;
type Story = StoryObj<StoryType>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    ngContent: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    size: 'lg',
    variant: 'secondary',
    ngContent: 'Secondary Button',
  },
};

export const Tertiary: Story = {
  args: {
    size: 'lg',
    variant: 'tertiary',
    ngContent: 'Tertiary Button',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    ngContent: 'Medium Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    ngContent: 'Small Button',
  },
};
