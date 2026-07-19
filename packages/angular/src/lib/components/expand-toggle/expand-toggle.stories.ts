import { Meta, StoryObj } from '@storybook/angular';
import { UniExpandToggleComponent as ExpandToggle } from './expand-toggle.component';

type StoryType = ExpandToggle;

const meta: Meta<StoryType> = {
  title: 'Components/Expand Toggle',
  component: ExpandToggle,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <ExpandToggle [collapsed]="collapsed" #toggle />
        <div>Collapsed: {{ toggle.collapsed() }}</div>
      `,
    };
  },
  argTypes: {
    collapsed: {
      control: 'boolean',
      description:
        'Two-way bound collapsed state. The toggle rotates 180° when expanded and shows a tooltip describing the action.',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    collapsed: true,
  },
};
