import { Meta, StoryObj } from '@storybook/angular';
import { UniTagInputComponent } from './tag-input.component';

const DIRECTORY = [
  { value: 'alice@uni.dev', label: 'Alice Chen', description: 'Design' },
  { value: 'bob@uni.dev', label: 'Bob Ferrari', description: 'Engineering' },
  { value: 'carol@uni.dev', label: 'Carol Nwosu', description: 'Product' },
  { value: 'priya@uni.dev', label: 'Priya Raman', description: 'Research' },
];

const meta: Meta<UniTagInputComponent> = {
  title: 'Components/Forms/Tag Input',
  component: UniTagInputComponent,
  args: { label: 'To', placeholder: 'Add a recipient…' },
  parameters: {
    componentSubtitle: 'Type-to-add chip field — recipients, filters, labels',
  },
};

export default meta;
type Story = StoryObj<UniTagInputComponent>;

export const Primary: Story = {
  args: { value: [{ value: 'alice@uni.dev', label: 'Alice Chen' }] },
};

/**
 * The `email` preset wires an address validator, a paste parser that unwraps
 * `Name <address>`, and Space as a separator. Suggestions come from the app —
 * refresh them from `(query)`.
 */
export const EmailRecipients: Story = {
  render: (args) => ({
    props: {
      ...args,
      suggestions: DIRECTORY,
      onQuery(text: string) {
        const q = text.toLowerCase();
        this['suggestions'] = q
          ? DIRECTORY.filter(
              (entry) =>
                entry.label.toLowerCase().includes(q) || entry.value.toLowerCase().includes(q)
            )
          : DIRECTORY;
      },
    },
    template: `
      <uni-tag-input
        label="To"
        preset="email"
        placeholder="Name or address…"
        [value]="value"
        [suggestions]="suggestions"
        (query)="onQuery($event)"
      />
    `,
  }),
  args: { value: [{ value: 'alice@uni.dev', label: 'Alice Chen' }] },
};

/** A malformed entry stays in the value, flagged, so it can be fixed. */
export const InvalidEntry: Story = {
  args: {
    preset: 'email',
    value: [
      { value: 'alice@uni.dev', label: 'Alice Chen' },
      { value: 'nope@@x', invalid: true },
    ],
  },
};

/** A locked token renders without a remove control. */
export const LockedEntry: Story = {
  args: {
    value: [
      { value: 'owner@uni.dev', label: 'Thread owner', disabled: true },
      { value: 'bob@uni.dev', label: 'Bob Ferrari' },
    ],
  },
};

export const WithMaximum: Story = {
  args: { max: 3, value: [{ value: 'alpha' }, { value: 'beta' }] },
};

export const Disabled: Story = {
  args: { disabled: true, value: [{ value: 'alpha' }, { value: 'beta' }] },
};
