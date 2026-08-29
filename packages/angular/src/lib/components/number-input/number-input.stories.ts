import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniNumberInputComponent } from './number-input.component';

type StoryType = UniNumberInputComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/NumberInput',
  component: UniNumberInputComponent,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `<uni-number-input ${argsToTemplate(props)}></uni-number-input>`,
    };
  },
  argTypes: {
    value: {
      control: 'number',
      description: 'Two-way bound value. `null` is empty — not 0, which is a real answer.',
    },
    valueAsString: {
      control: 'text',
      description:
        'Exact binding as a canonical decimal string. Bind this instead of `value` where precision matters; both stay in sync.',
    },
    label: { control: 'text', description: 'Required accessible name, e.g. "Unit price".' },
    placeholder: { control: 'text', description: 'Placeholder text.' },
    preset: {
      control: 'inline-radio',
      options: ['decimal', 'integer', 'currency', 'percent'],
      description:
        'Format archetype, supplying decimals, grouping, affix and inputmode. Default: `decimal`',
    },
    currency: {
      control: 'text',
      description: 'ISO 4217 code, e.g. `USD`. Implies `preset="currency"`.',
    },
    locale: { control: 'text', description: 'BCP 47 tag. Defaults to the document language.' },
    prefix: { control: 'text', description: 'Static adornment before the number.' },
    suffix: { control: 'text', description: 'Static adornment after the number.' },
    grouping: {
      control: 'inline-radio',
      options: ['auto', 'always', 'min2', false],
      description: 'Thousands-separator policy. Default: `min2` — a year stays 2026.',
    },
    roundingMode: {
      control: 'inline-radio',
      options: ['half-up', 'half-even', 'ceil', 'floor', 'trunc'],
      description: 'How a tie rounds. Default: `half-up`',
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'end', 'center'],
      description: 'Text alignment. Default: `start` — numeric columns should set `end`.',
    },
    stepperLayout: {
      control: 'inline-radio',
      options: ['stacked', 'split', 'trailing', 'none'],
      description: 'Where the stepper buttons sit. Default: `stacked`',
    },
    min: { control: 'number', description: 'Lower fence.' },
    max: { control: 'number', description: 'Upper fence.' },
    step: { control: 'number', description: 'Grid spacing. Default: 1' },
    largeStep: {
      control: 'number',
      description: 'Page Up/Down and Shift+Arrow. Default: `step × 10`',
    },
    smallStep: {
      control: 'number',
      description: 'Alt+Arrow fine nudge. Unset disables it.',
    },
    stepOrigin: {
      control: 'inline-radio',
      options: ['min', 'zero'],
      description: 'Snap-grid anchor. Default: `min`, matching the platform.',
    },
    wrap: {
      control: 'boolean',
      description: 'Cycle at the fences — cyclic fields only (hours, degrees).',
    },
    clampOnCommit: {
      control: 'boolean',
      description: 'Clamp an out-of-range commit rather than refusing it. Default: true',
    },
    emptyStepValue: {
      control: 'number',
      description: 'What ↑ commits on an empty field. Default: `min ?? 0`',
    },
    valueIsFraction: {
      control: 'boolean',
      description: 'The model is a fraction: 0.15 displays as 15%.',
    },
    unitAnnouncement: {
      control: 'text',
      description: 'Spoken long form of an abbreviated suffix, e.g. "kilograms" for kg.',
    },
    allowExpressions: {
      control: 'boolean',
      description: '`12*3` → 36. Off by default. Never uses eval.',
    },
    wheel: { control: 'boolean', description: 'Scroll-to-step. Off by default.' },
    repeat: { control: 'boolean', description: 'Hold-to-repeat on the steppers. Default: true' },
    selectOnFocus: { control: 'boolean', description: 'Select the text on focus.' },
    commitOnBlur: { control: 'boolean', description: 'Commit the draft on blur. Default: true' },
    readOnly: { control: 'boolean', description: 'Selectable text, no caret, no steppers.' },
    disabled: { control: 'boolean', description: 'Whether the field is disabled.' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  args: { label: 'Quantity', value: 1, min: 1, max: 99 },
};

export const Money: Story = {
  args: { label: 'Unit price', currency: 'USD', value: 1234.5, min: 0, step: 0.01 },
};

export const Percent: Story = {
  args: { label: 'Discount', preset: 'percent', value: 15, min: 0, max: 100 },
};

export const Units: Story = {
  args: {
    label: 'Weight',
    suffix: 'kg',
    unitAnnouncement: 'kilograms',
    value: 72,
    min: 0,
    step: 0.5,
  },
};

export const SplitSteppers: Story = {
  args: { label: 'Seats', preset: 'integer', stepperLayout: 'split', value: 2, min: 1, max: 8 },
};

export const Expressions: Story = {
  args: { label: 'Line total', currency: 'USD', allowExpressions: true, value: 350 },
};

export const CyclicHours: Story = {
  args: { label: 'Hour', preset: 'integer', value: 23, min: 0, max: 23, wrap: true },
};

export const NoSteppers: Story = {
  args: { label: 'Year', preset: 'integer', stepperLayout: 'none', value: 2026 },
};

export const ReadOnly: Story = {
  args: { label: 'Invoice total', currency: 'USD', value: 4820.75, readOnly: true },
};

export const Disabled: Story = {
  args: { label: 'Quantity', value: 3, disabled: true },
};
