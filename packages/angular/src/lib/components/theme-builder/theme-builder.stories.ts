import { Meta, StoryObj } from '@storybook/angular';
import { UniThemeBuilderComponent } from './theme-builder.component';

const meta: Meta<UniThemeBuilderComponent> = {
  title: 'Theme Builder/Color',
  component: UniThemeBuilderComponent,
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'todo' },
  },
  render: () => ({
    template: `<uni-theme-builder />`,
  }),
};

export default meta;
type Story = StoryObj<UniThemeBuilderComponent>;

export const Builder: Story = {};
