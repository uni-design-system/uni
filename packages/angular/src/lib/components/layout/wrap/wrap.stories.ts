import { Meta, StoryObj } from '@storybook/angular';
import { UniWrapComponent } from './wrap.component';

type StoryType = UniWrapComponent;

const meta: Meta<StoryType> = {
  title: 'Layout/Wrap',
  component: UniWrapComponent,
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {};
