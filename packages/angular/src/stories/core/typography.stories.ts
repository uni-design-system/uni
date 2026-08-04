import { Meta, StoryObj } from '@storybook/angular';
import { SbTypographyManifestComponent } from './typography-manifest.component';

type StoryType = SbTypographyManifestComponent;

const meta: Meta<StoryType> = {
  title: 'Core/Typography',
  component: SbTypographyManifestComponent,
  parameters: { controls: { disable: true } },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Manifest: Story = {
  render: () => ({ template: `<sb-typography-manifest />` }),
};
