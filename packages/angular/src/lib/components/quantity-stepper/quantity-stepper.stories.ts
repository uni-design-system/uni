import { Meta, StoryObj } from '@storybook/angular';
import { UniQuantityStepperComponent } from './quantity-stepper.component';

const meta: Meta<UniQuantityStepperComponent> = {
  title: 'Components/Forms/QuantityStepper',
  component: UniQuantityStepperComponent,
  args: { label: 'Quantity, Blue T-shirt (M)', value: 3, min: 1 },
  parameters: {
    componentSubtitle: 'Bare − n + for cart lines, table cells and seat counts',
  },
  argTypes: {
    value: {
      control: 'number',
      description: 'Two-way bound quantity. `null` is empty.',
    },
    label: {
      control: 'text',
      description:
        'Required accessible name, never visible. Name the thing being counted — "Quantity, Blue T-shirt (M)", not "Quantity".',
    },
    min: { control: 'number', description: 'Lower fence. Default: 0' },
    max: { control: 'number', description: 'Upper fence.' },
    step: { control: 'number', description: 'Grid spacing. Default: 1' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Overall height: 24 / 32 / 40px. Default: `md`',
    },
    editable: {
      control: 'boolean',
      description: 'false renders the number as text, for read-mostly tables. Default: true',
    },
    deleteAtMin: {
      control: 'boolean',
      description:
        'At `min` the − becomes a remove affordance and emits `removed` instead of stepping.',
    },
    disabled: { control: 'boolean', description: 'Whether the stepper is disabled.' },
  },
};

export default meta;
type Story = StoryObj<UniQuantityStepperComponent>;

export const Primary: Story = {};

/** The cart pattern: at quantity 1 the − becomes a remove control. */
export const CartLine: Story = {
  args: { value: 1, min: 1, deleteAtMin: true },
};

export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div row-layout gap="md" alignItems="center">
        <uni-quantity-stepper label="Quantity, small" size="sm" [value]="value" [min]="min" />
        <uni-quantity-stepper label="Quantity, medium" size="md" [value]="value" [min]="min" />
        <uni-quantity-stepper label="Quantity, large" size="lg" [value]="value" [min]="min" />
      </div>
    `,
  }),
};

/** Read-mostly tables: the number is text, and the buttons become the tab stops. */
export const ReadOnlyValue: Story = {
  args: { editable: false, value: 4 },
};

export const Bounded: Story = {
  args: { value: 8, min: 1, max: 8 },
};

export const Disabled: Story = {
  args: { disabled: true },
};
