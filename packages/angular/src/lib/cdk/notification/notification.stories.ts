import { Meta, StoryObj } from '@storybook/angular';
import { NotificationStoryComponent } from './notification.component';

type StoryType = NotificationStoryComponent;

const meta: Meta<StoryType> = {
  title: 'CDK/Notifications',
  component: NotificationStoryComponent,
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {},
};

export const Alert: Story = {
  args: { test: 'alert' },
};

export const Snackbar: Story = {
  args: { test: 'snackbar' },
};

export const Confirmation: Story = {
  args: { test: 'confirmation' },
};
