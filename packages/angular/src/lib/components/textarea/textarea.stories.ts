import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniTextareaComponent } from './textarea.component';

type StoryType = UniTextareaComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Textarea',
  component: UniTextareaComponent,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <uni-textarea ${argsToTemplate(props)}>
        </uni-textarea>
      `,
    };
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Two-way bound value of the field. Default: ""',
    },
    label: {
      control: 'text',
      description: 'Required label text; becomes the accessible name.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the field is empty. Default: ""',
    },
    rows: {
      control: 'number',
      description: "Visible text rows. Defaults to the theme's `textarea` options (3).",
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled. Default: false',
    },
    invalid: {
      control: 'boolean',
      description: 'Error state; styled once the field was touched or is dirty.',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  args: { label: 'Message', placeholder: 'Tell us everything…' },
};

export const Prefilled: Story = {
  args: {
    label: 'Bio',
    value: 'Design systems engineer.\nOKLCH enthusiast.',
    rows: 5,
  },
};

export const Invalid: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Required',
    invalid: true,
    touched: true,
  },
};

export const Disabled: Story = {
  args: { label: 'Notes', value: 'Read-only content', disabled: true },
};
