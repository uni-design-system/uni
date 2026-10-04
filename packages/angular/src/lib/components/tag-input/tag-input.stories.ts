import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniTagInputComponent } from './tag-input.component';
import { UniTagSuggestionDirective } from './tag-suggestion.directive';

const DIRECTORY = [
  { value: 'alice@uni.dev', label: 'Alice Chen', description: 'Design' },
  { value: 'bob@uni.dev', label: 'Bob Ferrari', description: 'Engineering' },
  { value: 'carol@uni.dev', label: 'Carol Nwosu', description: 'Product' },
  { value: 'priya@uni.dev', label: 'Priya Raman', description: 'Research' },
];

const meta: Meta<UniTagInputComponent> = {
  title: 'Components/Forms/Tag Input',
  component: UniTagInputComponent,
  decorators: [moduleMetadata({ imports: [UniTagSuggestionDirective] })],
  args: { label: 'To', placeholder: 'Add a recipient…' },
  argTypes: {
    openOnFocus: {
      description: 'Show the suggestions on focus and click, before anything is typed',
    },
    autoHighlight: {
      description: 'Keep the first suggestion active so Enter or Tab picks it without arrowing',
    },
    backspaceRemoves: {
      description:
        'Backspace in an empty field removes the last tag outright (default: focuses it)',
    },
    keepInvalidText: {
      description:
        "Refuse an invalid draft: it stays in the field and (rejected) fires with reason 'invalid'",
    },
    unframed: { description: 'Drop the field chrome and render the bare chip row' },
    autocomplete: { description: "The text field's autocomplete token (default 'off')" },
    draftChange: { description: 'Uncommitted text on every change, undebounced' },
  },
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
  args: { maxLength: 3, value: [{ value: 'alpha' }, { value: 'beta' }] },
};

export const Disabled: Story = {
  args: { disabled: true, value: [{ value: 'alpha' }, { value: 'beta' }] },
};

const GROUPED = [
  {
    value: 'alice@uni.dev',
    label: 'Alice Chen',
    description: 'alice@uni.dev',
    avatarName: 'Alice Chen',
    group: 'On this project',
  },
  {
    value: 'bob@uni.dev',
    label: 'Bob Ferrari',
    description: 'bob@uni.dev',
    avatarName: 'Bob Ferrari',
    group: 'On this project',
  },
  {
    value: 'carol@uni.dev',
    label: 'Carol Nwosu',
    description: 'carol@uni.dev',
    avatarName: 'Carol Nwosu',
    group: 'Other contacts',
  },
  {
    value: 'priya@uni.dev',
    label: 'Priya Raman',
    description: 'priya@uni.dev',
    avatarName: 'Priya Raman',
    group: 'Other contacts',
  },
];

/**
 * `group` puts a heading above each run of suggestions, `avatarName` gives a
 * row (and its chip) an initials lead, and `description` is painted under the
 * label. `openOnFocus` shows the list before anything is typed.
 */
export const GroupedSuggestions: Story = {
  render: (args) => ({
    props: { ...args, suggestions: GROUPED },
    template: `
      <uni-tag-input
        label="To"
        preset="email"
        placeholder="Name or address…"
        [openOnFocus]="true"
        [suggestions]="suggestions"
      />
    `,
  }),
};

/** A `uniTagSuggestion` template replaces a row's content; the field keeps
    owning the option element, its id and its active state. */
export const SuggestionTemplate: Story = {
  render: (args) => ({
    props: { ...args, suggestions: GROUPED },
    template: `
      <uni-tag-input label="To" preset="email" [openOnFocus]="true" [suggestions]="suggestions">
        <ng-template uniTagSuggestion let-person let-index="index">
          {{ index + 1 }}. {{ person.label }} — {{ person.value }}
        </ng-template>
      </uni-tag-input>
    `,
  }),
};

/** No border, fill or inset — an email client's To line. The surrounding
    layout draws the hairline. */
export const Unframed: Story = {
  args: {
    unframed: true,
    preset: 'email',
    value: [{ value: 'alice@uni.dev', label: 'Alice Chen', avatarName: 'Alice Chen' }],
  },
};
