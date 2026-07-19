import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { UniProgressGaugeComponent as ProgressGauge } from './progress-gauge.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<ProgressGauge> = {
  title: 'Components/Progress Gauge',
  component: ProgressGauge,
  decorators: [
    applicationConfig({
      providers: [],
    }),
  ],
  render: (args) => {
    const { percent, variant, size, ...props } = args;
    return {
      props,
      template: `
        <ProgressGauge percent="${percent}" variant="${variant}" size="${size}"></ProgressGauge>
    `,
    };
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg', 'xl'],
      control: 'radio',
      description: 'The size of the gauge as defined by the loaded theme.',
    },
  },
};

export default meta;

type Story = StoryObj<ProgressGauge>;

export const Default: Story = {
  args: {
    percent: 60,
    size: 'lg',
    variant: 'primary',
  },
};
