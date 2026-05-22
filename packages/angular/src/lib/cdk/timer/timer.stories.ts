import { Meta, StoryObj } from '@storybook/angular';
import { TimerStoryComponent } from './timer.component';

type StoryType = TimerStoryComponent;

const meta: Meta<StoryType> = {
  title: 'CDK/Timer',
  component: TimerStoryComponent,
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {},
};
