import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniMultiSelectDropdownComponent as MultiSelectDropdown } from './multi-select-dropdown.component';

type StoryType = MultiSelectDropdown;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Multi Select',
  component: MultiSelectDropdown,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <uni-multi-select-dropdown ${argsToTemplate(props)}>
        </uni-multi-select-dropdown>
      `,
    };
  },
  argTypes: {
    // Core Inputs
    options: {
      control: 'object',
      description:
        'Array of Option objects that define the available choices. Each option should have a value and label property. Default: []',
    },
    value: {
      control: 'object',
      description: 'Array of selected option values (FormValueControl). Default: []',
      table: {
        category: 'Form Control',
        type: { summary: 'T[]' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text displayed when no options are selected. Default: ""',
    },

    // Form Control Properties
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled (FormValueControl signal)',
      table: {
        category: 'Form Control',
        type: { summary: 'boolean' },
      },
    },
    touched: {
      control: 'boolean',
      description: 'Whether the component has been touched (FormValueControl signal)',
      table: {
        category: 'Form Control',
        type: { summary: 'boolean' },
      },
    },
    invalid: {
      control: 'boolean',
      description: 'Whether the component is in invalid state (FormValueControl signal)',
      table: {
        category: 'Form Control',
        type: { summary: 'boolean' },
      },
    },
    dirty: {
      control: 'boolean',
      description: 'Whether the component value has been changed (FormValueControl signal)',
      table: {
        category: 'Form Control',
        type: { summary: 'boolean' },
      },
    },

    // Methods
    selectAll: {
      description:
        'Method used to select all available options programmatically. Usage: multiSelectRef.selectAll()',
      table: {
        category: 'Methods',
        type: { summary: '() => void' },
      },
    },
    deselectAll: {
      description:
        'Method used to deselect all options programmatically. Usage: multiSelectRef.deselectAll()',
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
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
      { value: 'option4', label: 'Option 4' },
    ],
    value: ['option1', 'option3'],
  },
};

export const Empty: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    value: [],
  },
};

export const SingleSelection: Story = {
  args: {
    options: [
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'blue', label: 'Blue' },
    ],
    value: ['red'],
  },
};

export const ManyOptions: Story = {
  args: {
    options: [
      { value: 'option1', label: 'First Option' },
      { value: 'option2', label: 'Second Option' },
      { value: 'option3', label: 'Third Option' },
      { value: 'option4', label: 'Fourth Option' },
      { value: 'option5', label: 'Fifth Option' },
      { value: 'option6', label: 'Sixth Option' },
      { value: 'option7', label: 'Seventh Option' },
      { value: 'option8', label: 'Eighth Option' },
    ],
    value: ['option2', 'option4', 'option6'],
  },
};

export const Disabled: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    value: ['option1'],
    disabled: true,
  },
};

export const ErrorState: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    value: [],
    invalid: true,
    touched: true,
  },
};

export const WithPlaceholder: Story = {
  args: {
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'orange', label: 'Orange' },
      { value: 'grape', label: 'Grape' },
    ],
    value: [],
    placeholder: 'Choose your favorite fruits...',
  },
};
