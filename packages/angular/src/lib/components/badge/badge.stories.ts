import type { Meta, StoryObj } from '@storybook/angular';
import { UniBadgeComponent as Badge } from './badge.component';

type StoryType = Badge & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Badge',
  component: Badge,
  render: (args) => {
    const { ngContent, color, width, ...props } = args;
    return {
      props,
      template: `
        <Badge color="${color}" [width]="${width}">
          ${ngContent}
        </Badge>
      `,
    };
  },
  argTypes: {
    width: {
      description: 'The minimum width of the badge in pixels. This value is optional.',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Pass: Story = {
  args: {
    color: 'secondary',
    ngContent: 'Pass',
    width: 76,
  },
};

export const Fail: Story = {
  args: {
    color: 'warn',
    ngContent: 'Fail',
    width: 76,
  },
};
