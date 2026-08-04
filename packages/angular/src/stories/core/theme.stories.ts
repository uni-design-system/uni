import { Meta, StoryObj } from '@storybook/angular';
import { SbThemeManifestComponent, ThemeManifestSection } from './theme-manifest.component';

type StoryType = SbThemeManifestComponent;

const meta: Meta<StoryType> = {
  title: 'Core/Theme',
  component: SbThemeManifestComponent,
  parameters: { controls: { disable: true } },
};

export default meta;
type Story = StoryObj<StoryType>;

const section = (section: ThemeManifestSection): Story => ({
  render: () => ({ template: `<sb-theme-manifest section="${section}" />` }),
});

export const Colors: Story = section('colors');
export const Spacing: Story = section('spacing');
export const Radii: Story = section('radii');
export const Borders: Story = section('borders');
export const Shadows: Story = section('shadows');
export const Thicknesses: Story = section('thicknesses');
