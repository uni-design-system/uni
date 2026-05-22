import { Meta, StoryObj } from '@storybook/angular';
import { LocalStorageStoryComponent } from './local-storage.component';

type StoryType = LocalStorageStoryComponent;

const meta: Meta<StoryType> = {
  title: 'CDK/LocalStorage',
  component: LocalStorageStoryComponent,
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {},
};
