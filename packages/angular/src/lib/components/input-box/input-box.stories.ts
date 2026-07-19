import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniInputBoxComponent } from './input-box.component';

type StoryType = UniInputBoxComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Input Box',
  component: UniInputBoxComponent,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <uni-input-box ${argsToTemplate(props)}>
          <input type="text" placeholder="Type here..." />
        </uni-input-box>
      `,
    };
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Applies the disabled colors and blocks the not-allowed cursor.',
    },
    error: {
      control: 'boolean',
      description:
        'Switches the box to its error color, border, and shadow from the input theme options.',
    },
    minWidth: {
      control: 'text',
      description: 'Minimum width of the box. Default: "0".',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    disabled: false,
    error: false,
  },
};

export const ErrorState: Story = {
  args: {
    disabled: false,
    error: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    error: false,
  },
};
