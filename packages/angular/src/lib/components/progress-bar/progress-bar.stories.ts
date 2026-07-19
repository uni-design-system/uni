import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniProgressBarComponent as ProgressBar } from './progress-bar.component';

type StoryType = ProgressBar;

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<StoryType> = {
  title: 'Components/Progress Bar',
  component: ProgressBar,
  decorators: [
    applicationConfig({
      providers: [],
    }),
  ],
  render: (args) => {
    const { percent, ...props } = args;
    return {
      props,
      template: `<ProgressBar percent="${percent}" ${argsToTemplate(props)}></ProgressBar>`,
    };
  },
  argTypes: {
    percent: {
      description: 'The percentage of completion.',
      control: { type: 'range', min: 0, max: 100, step: 0.1 },
    },
    height: {
      description: 'Height in pixels.',
      control: { type: 'range', min: 8, max: 32, step: 4 },
    },
    width: {
      description: 'Width in pixels.',
      control: { type: 'range', min: 128, max: 640, step: 4 },
    },
  },
};

export default meta;

type Story = StoryObj<StoryType>;

export const Default: Story = {
  args: {
    percent: 60,
  },
};
