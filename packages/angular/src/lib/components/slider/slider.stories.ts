import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniSliderComponent } from './slider.component';

type StoryType = UniSliderComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Slider',
  component: UniSliderComponent,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `<uni-slider ${argsToTemplate(props)}></uni-slider>`,
    };
  },
  argTypes: {
    value: {
      control: 'object',
      description:
        'Two-way bound value. A number in `single` mode, a `{ start, end }` range in `range` mode. `null` is empty.',
    },
    label: {
      control: 'text',
      description: 'Required accessible name. Names the group in range mode.',
    },
    mode: {
      control: 'inline-radio',
      options: ['single', 'range'],
      description: 'One thumb or two. Default: `single`',
    },
    min: { control: 'number', description: 'Lower bound. Default: 0' },
    max: { control: 'number', description: 'Upper bound. Default: 100' },
    step: { control: 'number', description: 'Grid spacing. Default: 1' },
    largeStep: {
      control: 'number',
      description: 'Page Up/Down and Shift+Arrow. Default: a tenth of the range.',
    },
    origin: {
      control: 'number',
      description: 'Fill anchor. Defaults to `min`; set 0 for a slider that spans ±.',
    },
    marks: {
      control: 'object',
      description: 'Stops as `{ value, label? }`. Labels are spoken instead of the number.',
    },
    snapToMarks: {
      control: 'boolean',
      description: 'Marks become the only valid stops. Default: false',
    },
    valueDisplay: {
      control: 'inline-radio',
      options: ['none', 'inline', 'tooltip'],
      description: 'Where the current value is shown. Default: `none`',
    },
    minGap: {
      control: 'number',
      description: 'Enforced distance between the ends, in range mode.',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'warn', 'success'],
      description: 'Role pair driving the fill and thumb colour. Default: `primary`',
    },
    disabled: { control: 'boolean', description: 'Whether the slider is disabled.' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  args: { label: 'Volume', value: 40, valueDisplay: 'inline' },
};

export const SteppedRange: Story = {
  args: { label: 'Opacity', min: 0, max: 1, step: 0.05, value: 0.6, valueDisplay: 'inline' },
};

export const TwoThumbs: Story = {
  args: {
    label: 'Price range',
    mode: 'range',
    min: 0,
    max: 1000,
    step: 10,
    minGap: 50,
    value: { start: 200, end: 700 },
    valueDisplay: 'inline',
  },
};

export const Marks: Story = {
  args: {
    label: 'Size',
    min: 1,
    max: 5,
    value: 3,
    snapToMarks: true,
    marks: [
      { value: 1, label: 'XS' },
      { value: 2, label: 'S' },
      { value: 3, label: 'M' },
      { value: 4, label: 'L' },
      { value: 5, label: 'XL' },
    ],
  },
};

export const Tooltip: Story = {
  args: { label: 'Brightness', value: 64, valueDisplay: 'tooltip' },
};

export const SpanningZero: Story = {
  args: { label: 'Balance', min: -100, max: 100, origin: 0, value: -40, valueDisplay: 'inline' },
};

export const Variant: Story = {
  args: { label: 'Storage used', value: 88, variant: 'warn', valueDisplay: 'inline' },
};

export const Disabled: Story = {
  args: { label: 'Brightness', value: 70, disabled: true },
};
