import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniInputComponent } from './input.component';

type StoryType = UniInputComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Input',
  component: UniInputComponent,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <uni-input ${argsToTemplate(props)}>
        </uni-input>
      `,
    };
  },
  argTypes: {
    // Core Inputs
    value: {
      control: 'text',
      description: 'Two-way bound value of the input field. Default: ""',
    },
    label: {
      control: 'text',
      description: 'Required label text displayed for the input field.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the input is empty. Default: ""',
    },

    // Status Inputs
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled. Default: false',
    },
    touched: {
      control: 'boolean',
      description:
        'Two-way bound touched state - indicates if the user has interacted with the field. Default: false',
    },
    invalid: {
      control: 'boolean',
      description: 'Whether the input is in an invalid state. Default: false',
    },
    dirty: {
      control: 'boolean',
      description:
        'Whether the input value has been changed from its initial state. Default: false',
    },

    // Methods
    markAsTouched: {
      description:
        'Method used to manually mark the input as touched. Usage: inputRef.markAsTouched()',
      table: {
        category: 'Methods',
        type: { summary: '() => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    value: '',
    disabled: false,
    touched: false,
    invalid: false,
    dirty: false,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    value: 'john.doe',
    disabled: false,
    touched: true,
    invalid: false,
    dirty: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    value: 'Cannot edit this',
    disabled: true,
    touched: false,
    invalid: false,
    dirty: false,
  },
};

export const Invalid: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    value: 'invalid-email',
    disabled: false,
    touched: true,
    invalid: true,
    dirty: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'This field is required',
    value: '',
    disabled: false,
    touched: true,
    invalid: true,
    dirty: false,
  },
};

export const LongLabel: Story = {
  args: {
    label: 'A Very Long Label That Demonstrates How The Component Handles Extended Text',
    placeholder: 'Enter some text',
    value: '',
    disabled: false,
    touched: false,
    invalid: false,
    dirty: false,
  },
};
