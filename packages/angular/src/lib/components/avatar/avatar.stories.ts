import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UniAvatarComponent } from './avatar.component';
import { UniAvatarGroupComponent } from './avatar-group.component';

type StoryType = UniAvatarComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Data Display/Avatar',
  component: UniAvatarComponent,
  decorators: [moduleMetadata({ imports: [UniAvatarGroupComponent] })],
  argTypes: {
    name: {
      control: 'text',
      description: 'Person name — drives the initials and the accessible label.',
    },
    src: {
      control: 'text',
      description: 'Image URL; falls back to initials, then a symbol, on error.',
    },
    text: {
      control: 'text',
      description: 'Verbatim text instead of derived initials (e.g. "+3").',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'quaternary', 'warn', 'success'],
      description: 'Container palette for initials/symbol rendering. Default: primary',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Avatar size from the theme scale. Default: lg',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Initials: Story = {
  args: { name: 'Grace Hopper', variant: 'primary', size: 'lg' },
};

export const SizesAndVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <uni-avatar name="Ada Lovelace" size="sm" />
        <uni-avatar name="Grace Hopper" size="md" variant="secondary" />
        <uni-avatar name="Katherine Johnson" size="lg" variant="tertiary" />
        <uni-avatar name="Annie Easley" size="xl" variant="success" />
        <uni-avatar size="lg" variant="quaternary" />
      </div>
    `,
  }),
};

export const Group: Story = {
  render: () => ({
    template: `
      <uni-avatar-group [max]="3" size="md">
        <uni-avatar name="Ada Lovelace" />
        <uni-avatar name="Grace Hopper" variant="secondary" />
        <uni-avatar name="Katherine Johnson" variant="tertiary" />
        <uni-avatar name="Annie Easley" variant="success" />
        <uni-avatar name="Mary Jackson" variant="warn" />
      </uni-avatar-group>
    `,
  }),
};
