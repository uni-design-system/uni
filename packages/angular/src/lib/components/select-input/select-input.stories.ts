import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniSelectComponent } from './select-input.component';

type StoryType = UniSelectComponent<string>;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Select',
  component: UniSelectComponent,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <uni-select ${argsToTemplate(props)}>
        </uni-select>
      `,
    };
  },
  argTypes: {
    // Core Inputs
    value: {
      control: 'text',
      description:
        'Two-way bound value of the selected option. Can be null for no selection (model signal).',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when no option is selected.',
    },
    options: {
      control: 'object',
      description:
        'Array of Option objects that define the available choices. Each option should have a value and label property.',
    },

    // Status Inputs
    disabled: {
      control: 'boolean',
      description:
        'Whether the select input is disabled (input signal). Default: false',
    },
    touched: {
      control: 'boolean',
      description:
        'Two-way bound touched state - indicates if the user has interacted with the field (model signal). Default: false',
    },
    invalid: {
      control: 'boolean',
      description:
        'Whether the select input is in an invalid state (input signal). Default: false',
    },
    dirty: {
      control: 'boolean',
      description:
        'Whether the field has been modified from its initial value (input signal). Default: false',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    placeholder: 'Select your country...',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'au', label: 'Australia' },
    ],
    value: null,
    disabled: false,
    touched: false,
    invalid: false,
    dirty: false,
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Select priority...',
    options: [
      { value: 'low', label: 'Low Priority' },
      { value: 'medium', label: 'Medium Priority' },
      { value: 'high', label: 'High Priority' },
      { value: 'urgent', label: 'Urgent' },
    ],
    value: 'high',
    disabled: false,
    touched: true,
    invalid: false,
    dirty: false,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Cannot select...',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    value: 'option2',
    disabled: true,
    touched: false,
    invalid: false,
    dirty: false,
  },
};

export const Invalid: Story = {
  args: {
    placeholder: 'Please select an option...',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'maybe', label: 'Maybe' },
    ],
    value: null,
    disabled: false,
    touched: true,
    invalid: true,
  },
};

export const ManyOptions: Story = {
  args: {
    placeholder: 'Select state or province...',
    options: [
      { value: 'al', label: 'Alabama' },
      { value: 'ak', label: 'Alaska' },
      { value: 'az', label: 'Arizona' },
      { value: 'ar', label: 'Arkansas' },
      { value: 'ca', label: 'California' },
      { value: 'co', label: 'Colorado' },
      { value: 'ct', label: 'Connecticut' },
      { value: 'de', label: 'Delaware' },
      { value: 'fl', label: 'Florida' },
      { value: 'ga', label: 'Georgia' },
      { value: 'hi', label: 'Hawaii' },
      { value: 'id', label: 'Idaho' },
      { value: 'il', label: 'Illinois' },
      { value: 'in', label: 'Indiana' },
      { value: 'ia', label: 'Iowa' },
    ],
    value: 'ca',
    disabled: false,
    touched: true,
    invalid: false,
    dirty: false,
  },
};

export const ShortOptions: Story = {
  args: {
    placeholder: 'Pick a size...',
    options: [
      { value: 'xs', label: 'XS' },
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
      { value: 'xl', label: 'XL' },
    ],
    value: 'm',
    disabled: false,
    touched: false,
    invalid: false,
    dirty: false,
  },
};
