import { Meta, StoryObj } from '@storybook/angular';
import { UniNumberRangeInputComponent } from './number-range-input.component';

const meta: Meta<UniNumberRangeInputComponent> = {
  title: 'Components/Forms/NumberRangeInput',
  component: UniNumberRangeInputComponent,
  args: { label: 'Price range', value: { start: 50, end: 500 } },
  parameters: {
    componentSubtitle: 'Two linked numeric fields, one { start, end } value',
  },
  argTypes: {
    value: {
      control: 'object',
      description:
        'Two-way bound `{ start, end }`. Either end alone is valid — `{ start: 50 }` means "50 and up". `null` is empty.',
    },
    label: { control: 'text', description: 'Required accessible name for the group.' },
    startLabel: {
      control: 'text',
      description: 'Names the lower end, appended to `label`. Default: `Minimum`',
    },
    endLabel: {
      control: 'text',
      description: 'Names the upper end, appended to `label`. Default: `Maximum`',
    },
    preset: {
      control: 'inline-radio',
      options: ['decimal', 'integer', 'currency', 'percent'],
      description: 'Forwarded to both ends, so they always read alike.',
    },
    currency: { control: 'text', description: 'ISO 4217 code, e.g. `USD`.' },
    prefix: { control: 'text', description: 'Static adornment on both ends.' },
    suffix: { control: 'text', description: 'Static adornment on both ends.' },
    min: { control: 'number', description: 'Outer lower fence.' },
    max: { control: 'number', description: 'Outer upper fence.' },
    step: { control: 'number', description: 'Grid spacing. Default: 1' },
    minGap: {
      control: 'number',
      description: 'Enforced distance between the ends. Fences both steppers.',
    },
    disabled: { control: 'boolean', description: 'Whether the field is disabled.' },
  },
};

export default meta;
type Story = StoryObj<UniNumberRangeInputComponent>;

export const Primary: Story = {};

/** A price filter: the preset gives both ends the same currency treatment. */
export const PriceFilter: Story = {
  args: {
    label: 'Price range',
    currency: 'USD',
    min: 0,
    max: 5000,
    step: 10,
    value: { start: 200, end: 1500 },
  },
};

/** `minGap` keeps the ends apart and fences both steppers at the boundary. */
export const MinimumGap: Story = {
  args: { label: 'Temperature tolerance', suffix: '°C', min: -20, max: 40, minGap: 5, value: { start: 5, end: 20 } },
};

/** One end alone is a real filter — "50 and up". */
export const OpenEnded: Story = {
  args: { label: 'Price range', currency: 'USD', value: { start: 50 } },
};

export const CustomEndLabels: Story = {
  args: { label: 'Delivery window', suffix: ' days', startLabel: 'From', endLabel: 'To', min: 0, value: { start: 2, end: 7 } },
};

export const Disabled: Story = {
  args: { disabled: true },
};
