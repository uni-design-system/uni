import { Meta, StoryObj } from '@storybook/angular';
import { UniContactInputComponent } from './contact-input.component';
import type { UniContact } from './contact-input.model';

const CONTACTS: UniContact[] = [
  { value: 'alice@uni.dev', name: 'Alice Chen', note: 'Design' },
  { value: 'bob@uni.dev', name: 'Bob Ferrari', note: 'Engineering' },
  { value: 'carol@uni.dev', name: 'Carol Nwosu', note: 'Product' },
  { value: 'priya@uni.dev', name: 'Priya Raman', note: 'Research' },
  { value: 'studio@uni.dev' },
];

const GROUPED: UniContact[] = [
  { value: 'alice@uni.dev', name: 'Alice Chen', group: 'On this project' },
  { value: 'bob@uni.dev', name: 'Bob Ferrari', group: 'On this project' },
  { value: 'carol@uni.dev', name: 'Carol Nwosu', note: 'North Hills', group: 'Other contacts' },
  { value: 'priya@uni.dev', name: 'Priya Raman', note: 'Harbor Row', group: 'Other contacts' },
];

const meta: Meta<UniContactInputComponent> = {
  title: 'Components/Forms/Contact Input',
  component: UniContactInputComponent,
  args: { label: 'To', placeholder: 'Name or address…', contacts: CONTACTS },
  argTypes: {
    value: { description: 'The people in the field: UniContact[] — { value, name?, email?, … }' },
    contacts: {
      description: 'Everyone who can be suggested, in the order (and groups) to offer them',
    },
    allowCustom: {
      description: 'Accept a typed address that is not a known contact (default true)',
    },
    validate: {
      description:
        'What a typed value must satisfy under allowCustom; defaults to an email address',
    },
    filterLocally: {
      description:
        'Filter contacts in-component (default). false renders them verbatim — narrow them app-side from (query)',
    },
    autoHighlight: {
      description:
        'Keep the first match highlighted so Enter or Tab picks it without arrowing (default false)',
    },
    unframed: { description: 'Drop the field chrome and render a bare row' },
    maxLength: { description: 'Maximum number of people; bound as [max]' },
    autocomplete: { description: "The text field's autocomplete token (default 'off')" },
    added: { description: 'A person was added' },
    removed: { description: 'A person was removed' },
    rejected: {
      description:
        "Typed text did not become a person — { raw, reason }; an 'invalid' one stays in the field",
    },
    query: { description: 'Debounced typed text, for loading contacts remotely' },
    draftChange: { description: 'Typed text on every change, e.g. to clear an error once edited' },
  },
  parameters: {
    componentSubtitle: 'Recipient field — pick people from a contact list, or type an address',
  },
};

export default meta;
type Story = StoryObj<UniContactInputComponent>;

export const Primary: Story = {
  args: { value: [{ value: 'alice@uni.dev', name: 'Alice Chen' }] },
};

/** `group` on a contact puts a heading above each run that shares it. */
export const GroupedContacts: Story = {
  args: { contacts: GROUPED },
};

/**
 * No border, fill or inset — an email client's To line. The surrounding
 * layout draws the hairline.
 */
export const Unframed: Story = {
  args: { unframed: true, value: [{ value: 'alice@uni.dev', name: 'Alice Chen' }] },
};

/** `allowCustom` off restricts the field to the contact list; anything else
    is refused and stays in the field. */
export const KnownContactsOnly: Story = {
  args: { allowCustom: false, placeholder: 'Search people…' },
};

export const Disabled: Story = {
  args: { disabled: true, value: [{ value: 'alice@uni.dev', name: 'Alice Chen' }] },
};
