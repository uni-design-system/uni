import { Meta, StoryObj } from '@storybook/angular';
import { SbIconManifestComponent } from './icon-manifest.component';

type StoryType = SbIconManifestComponent;

const meta: Meta<StoryType> = {
  title: 'Core/Iconography',
  component: SbIconManifestComponent,
  parameters: { controls: { disable: true } },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Manifest: Story = {
  render: () => ({ template: `<sb-icon-manifest />` }),
};
