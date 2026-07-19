import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniDebounceInputComponent as DebounceInput } from './debounce-input.component';

type StoryType = DebounceInput;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Debounce Input',
  component: DebounceInput,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <DebounceInput ${argsToTemplate(props)} (change)="lastEmitted = $event" #debounce />
        <div style="margin-top: 16px;">
          <div>Live value: {{ debounce.value() }}</div>
          <div>Debounced value: {{ lastEmitted }}</div>
        </div>
      `,
    };
  },
  argTypes: {
    inputName: {
      control: 'text',
      description: 'The name attribute applied to the native input.',
    },
    inputId: {
      control: 'text',
      description: 'The id attribute applied to the native input.',
    },
    debounceTime: {
      control: 'number',
      description:
        'Milliseconds to wait after the last keystroke before emitting `change`. Default: 400.',
    },
    change: {
      description:
        'Emits the input value after the debounce window, only when the value actually changed.',
      action: 'change',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    inputName: 'search',
    debounceTime: 400,
  },
};
