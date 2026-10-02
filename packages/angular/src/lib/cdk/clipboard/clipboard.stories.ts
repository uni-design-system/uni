import { Meta, StoryObj } from '@storybook/angular';
import { ClipboardStoryComponent } from './clipboard.component';

type StoryType = ClipboardStoryComponent;

const meta: Meta<StoryType> = {
  title: 'Utilities/Clipboard',
  component: ClipboardStoryComponent,
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {},
};
