import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniBoxDirective } from '../layout';
import { UniTagGroupComponent } from './tag-group.component';
import type { UniTagGroupItem } from './tag.model';

const FACETS: UniTagGroupItem[] = [
  { label: 'Design', value: 'design' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Legal', value: 'legal' },
  { label: 'Finance', value: 'finance' },
  { label: 'Operations', value: 'operations' },
  { label: 'Support', value: 'support' },
  { label: 'People', value: 'people' },
  { label: 'Research', value: 'research' },
  { label: 'Data platform', value: 'data' },
  { label: 'Security', value: 'security' },
];

const meta: Meta<UniTagGroupComponent> = {
  title: 'Components/Data Display/Tag Group',
  component: UniTagGroupComponent,
  decorators: [moduleMetadata({ imports: [UniBoxDirective] })],
  args: { items: FACETS, multiple: true },
  argTypes: {
    layout: {
      control: 'inline-radio',
      options: ['wrap', 'justify'],
      description: 'Natural widths, or filled rows stretched flush.',
    },
    chipTone: { control: 'inline-radio', options: ['soft', 'solid', 'outline'] },
    chipSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    componentSubtitle: 'A row of chips the user picks from',
  },
};

export default meta;
type Story = StoryObj<UniTagGroupComponent>;

/** Chips keep their natural widths and wrap when they run out of room. */
export const Wrap: Story = {
  args: { value: ['engineering'] },
};

/**
 * Filled rows stretch flush to both edges; the last row keeps its natural
 * widths, the way justified text leaves its last line alone. Narrow the preview
 * to watch the rows re-justify — and note the leads and remove controls stay
 * tucked into the rounded ends as the pills grow.
 */
export const Justify: Story = {
  args: { layout: 'justify', value: ['design', 'security'] },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 520px">
        <uni-tag-group
          [items]="items"
          [value]="value"
          [multiple]="multiple"
          layout="justify"
        />
      </div>
    `,
  }),
};

/** One at a time: picking a chip replaces the selection rather than adding. */
export const SingleSelect: Story = {
  args: { multiple: false, value: ['legal'] },
};

/** Per-item overrides sit on the item, not in markup. */
export const MixedChips: Story = {
  args: {
    items: [
      { label: 'Starred', value: 'starred', iconName: 'star' },
      { label: 'Live', value: 'live', dot: true, variant: 'success' },
      { label: 'Alice Chen', value: 'alice', avatarName: 'Alice Chen' },
      { label: 'Blocked', value: 'blocked', variant: 'warn', tone: 'outline' },
      { label: 'Archived', value: 'archived', disabled: true },
      { label: 'Custom', value: 'custom', removable: true },
    ],
  },
};
