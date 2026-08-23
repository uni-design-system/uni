import { Meta, StoryObj } from '@storybook/angular';
import { UniWrapDirective } from './wrap.directive';

type StoryType = UniWrapDirective;

const meta: Meta<StoryType> = {
  title: 'Components/Layout/Wrap',
  component: UniWrapDirective,
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {};
