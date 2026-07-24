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
    value: { control: 'number', description: 'Two-way bound value. Default: 0' },
    label: { control: 'text', description: 'Required accessible name.' },
    min: { control: 'number', description: 'Lower bound. Default: 0' },
    max: { control: 'number', description: 'Upper bound. Default: 100' },
    step: { control: 'number', description: 'Increment granularity. Default: 1' },
    disabled: { control: 'boolean', description: 'Whether the slider is disabled.' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  args: { label: 'Volume', value: 40 },
};

export const SteppedRange: Story = {
  args: { label: 'Opacity', min: 0, max: 1, step: 0.05, value: 0.6 },
};

export const Disabled: Story = {
  args: { label: 'Brightness', value: 70, disabled: true },
};
