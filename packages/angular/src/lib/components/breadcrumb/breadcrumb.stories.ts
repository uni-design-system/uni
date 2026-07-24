import { Meta, StoryObj } from '@storybook/angular';
import { UniBreadcrumbComponent } from './breadcrumb.component';

type StoryType = UniBreadcrumbComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Navigation/Breadcrumb',
  component: UniBreadcrumbComponent,
  argTypes: {
    items: {
      control: 'object',
      description: 'The trail, root first; the last item is the current page.',
    },
    ariaLabel: {
      control: 'text',
      description: 'Landmark label. Default: "Breadcrumb"',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Reports', href: '#' },
      { label: 'Q3 Revenue' },
    ],
  },
};

export const RouterDriven: Story = {
  name: 'Router-driven (no hrefs)',
  args: {
    items: [{ label: 'Home' }, { label: 'Settings' }, { label: 'Notifications' }],
  },
};
