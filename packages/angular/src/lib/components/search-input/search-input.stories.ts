import { Meta, StoryObj } from '@storybook/angular';
import { UniSearchInputComponent as Search } from './search-input.component';

type StoryType = Search;

const meta: Meta<StoryType> = {
  title: 'Components/Search Input',
  component: Search,
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    label: 'Search',
  },
};
