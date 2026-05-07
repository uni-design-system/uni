import type { Meta, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from './button.component';

const meta: Meta<UniButtonComponent> = {
  title: 'Components/UniButton',
  component: UniButtonComponent, // Storybook 11+ handles standalone components automatically here
  render: (args) => ({
    props: args,
    // We don't need 'template' if we just want to render the component as is
  }),
};

export default meta;
type Story = StoryObj<UniButtonComponent>;

export const Primary: Story = {
  args: {
    label: 'My Angular Component',
  },
};
