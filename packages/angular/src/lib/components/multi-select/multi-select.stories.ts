import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniMultiSelectComponent } from './multi-select.component';

type StoryType = UniMultiSelectComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Multi Select',
  component: UniMultiSelectComponent,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <uni-multi-select ${argsToTemplate(props)}>
        </uni-multi-select>
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
    selections: {
      control: 'object',
      description:
        'Array of strings representing the currently selected option values. Can be null or undefined to indicate no selections. Default: undefined',
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

    // Outputs/Events
    updates: {
      description:
        'Output event that emits an array of selected values when the selection changes. Emits undefined when all selections are cleared.',
      table: {
        category: 'Outputs',
        type: { summary: 'EventEmitter<string[] | undefined>' },
      },
      action: 'selection updated',
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
    selections: ['option1', 'option3'],
  },
};

export const Empty: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    selections: undefined,
  },
};

export const SingleSelection: Story = {
  args: {
    options: [
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'blue', label: 'Blue' },
    ],
    selections: ['red'],
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
    selections: ['option2', 'option4', 'option6'],
  },
};
