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
        <uni-expand-toggle [collapsed]="collapsed" #toggle />
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
    label: {
      control: 'text',
      description:
        'Names the region. Setting it switches the toggle to a full-width labelled row; the label becomes the button’s accessible name.',
    },
    sublabel: {
      control: 'text',
      description: 'Muted qualifier beside the label. Requires `label`.',
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

export const Labelled: Story = {
  args: {
    collapsed: true,
    label: 'Dimensions & Materials',
    sublabel: 'for POs & custom orders',
  },
};
