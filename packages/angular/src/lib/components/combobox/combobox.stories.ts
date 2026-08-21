import { Meta, StoryObj } from '@storybook/angular';
import type { Options } from '../../cdk';
import { UniComboboxComponent } from './combobox.component';

const STATES: Options<string> = [
  ['Alabama', 'Montgomery'], ['Alaska', 'Juneau'], ['Arizona', 'Phoenix'],
  ['Arkansas', 'Little Rock'], ['California', 'Sacramento'], ['Colorado', 'Denver'],
  ['Connecticut', 'Hartford'], ['Delaware', 'Dover'], ['Florida', 'Tallahassee'],
  ['Georgia', 'Atlanta'], ['Hawaii', 'Honolulu'], ['Idaho', 'Boise'],
  ['Illinois', 'Springfield'], ['Indiana', 'Indianapolis'], ['Iowa', 'Des Moines'],
  ['Kansas', 'Topeka'], ['Kentucky', 'Frankfort'], ['Louisiana', 'Baton Rouge'],
  ['Maine', 'Augusta'], ['Maryland', 'Annapolis'], ['Massachusetts', 'Boston'],
  ['Michigan', 'Lansing'], ['Minnesota', 'St. Paul'], ['Mississippi', 'Jackson'],
  ['Missouri', 'Jefferson City'], ['Montana', 'Helena'], ['Nebraska', 'Lincoln'],
  ['Nevada', 'Carson City'], ['New Hampshire', 'Concord'], ['New Jersey', 'Trenton'],
  ['New Mexico', 'Santa Fe'], ['New York', 'Albany'], ['North Carolina', 'Raleigh'],
  ['North Dakota', 'Bismarck'], ['Ohio', 'Columbus'], ['Oklahoma', 'Oklahoma City'],
  ['Oregon', 'Salem'], ['Pennsylvania', 'Harrisburg'], ['Rhode Island', 'Providence'],
  ['South Carolina', 'Columbia'], ['South Dakota', 'Pierre'], ['Tennessee', 'Nashville'],
  ['Texas', 'Austin'], ['Utah', 'Salt Lake City'], ['Vermont', 'Montpelier'],
  ['Virginia', 'Richmond'], ['Washington', 'Olympia'], ['West Virginia', 'Charleston'],
  ['Wisconsin', 'Madison'], ['Wyoming', 'Cheyenne'],
].map(([label, description]) => ({ label, value: label, description }));

const ASSIGNEES: Options<string> = [
  { label: 'Alice Chen', value: 'u1', description: 'alice@uni.dev' },
  { label: 'Ben Okafor', value: 'u2', description: 'ben@uni.dev' },
  { label: 'Carol Nwosu', value: 'u3', description: 'carol@uni.dev' },
  { label: 'Dmitri Volkov', value: 'u4', description: 'dmitri@partners.io' },
  { label: 'Priya Raman', value: 'u5', description: 'OOO until Sep 2', disabled: true },
  { label: 'Sam Whitfield', value: 'u6', description: 'OOO until Aug 29', disabled: true },
  { label: 'Tessa Morgan', value: 'u7', description: 'tessa@uni.dev' },
];

const COUNTRIES: Options<string> = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'Colombia',
  'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'India', 'Indonesia',
  'Ireland', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kenya', 'Mexico', 'Morocco', 'Netherlands',
  'New Zealand', 'Nigeria', 'Norway', 'Peru', 'Poland', 'Portugal', 'Singapore', 'South Africa',
  'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'United Kingdom', 'United States',
  'Uruguay', 'Vietnam',
].map((label) => ({ label, value: label }));

const meta: Meta<UniComboboxComponent<string>> = {
  title: 'Components/Forms/Combobox',
  component: UniComboboxComponent,
  args: { label: 'State', placeholder: 'Choose a state', options: STATES },
  argTypes: {
    value: {
      description:
        "The committed option's value, T | null — never its label and never the draft text",
    },
    options: {
      description: 'The closed set: { label, value, description?, disabled? } (cdk Options<T>)',
    },
    compareWith: {
      description:
        'Equality matching value against option values; pass a key comparison for object values',
    },
    filterLocally: {
      description:
        'Filter the list in-component (default). false renders options verbatim — narrow them app-side from (query)',
    },
    filterWith: {
      description: 'Filter predicate; the default is locale-lowercased label-contains',
    },
    query: { description: 'Debounced draft text, for async option lists' },
    debounceTime: { description: 'Debounce for (query) and count announcements (default 250)' },
    clearable: {
      description: 'Show a ✕ while a value is set; an emptied field on blur also clears',
    },
    commitOnBlur: { description: 'Blur commits an exact-match draft (default true)' },
    emptyText: { description: 'i18n-able empty row, also announced when nothing matches' },
    selected: { description: 'An option committed' },
    rejected: { description: 'A commit was refused (no match); the field reverted — { query }' },
  },
  parameters: {
    componentSubtitle: 'Closed-set single-select autocomplete — typing filters, never selects',
  },
};

export default meta;
type Story = StoryObj<UniComboboxComponent<string>>;

export const Primary: Story = {
  args: { value: 'Arizona' },
};

/**
 * `description` renders as a secondary line and is read as part of the
 * option's name. `disabled` options stay visible and announced but cannot be
 * committed — the arrows skip them.
 */
export const DisabledOptions: Story = {
  args: { label: 'Assignee', placeholder: 'Choose a person', options: ASSIGNEES },
};

/**
 * `filterLocally=false` is the async story: options render verbatim and the
 * app narrows them from the debounced `(query)` — byte-for-byte the
 * search-input contract. The value survives while options load; the field
 * self-heals when they arrive.
 */
export const Async: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: [] as Options<string>,
      onQuery(text: string) {
        const query = text.toLowerCase();
        this['options'] = query
          ? COUNTRIES.filter((country) => country.label.toLowerCase().includes(query))
          : [];
      },
    },
    template: `
      <uni-combobox
        label="Country"
        placeholder="Type to search countries"
        emptyText="No countries found"
        [filterLocally]="false"
        [options]="options"
        (query)="onQuery($event)"
      />
    `,
  }),
};

/**
 * The combobox never commits free text implicitly — that's the closed-set
 * contract. To offer "create new", make creation an *option*: narrow matches
 * from `(query)` and, when nothing matches exactly, append a sentinel
 * `Create "…"` row. Because the sentinel is a real option, every commit path
 * works — arrow + Enter, click, and Enter when the filter narrows to it alone.
 * Resolve the sentinel in `(selected)`: mint the entity, add it to `options`,
 * write the model. Blur deliberately does not commit the sentinel (blur
 * commits exact label matches only) — creating takes an explicit Enter or
 * click. For a lighter touch, listen to `(rejected)` instead and offer
 * creation outside the control.
 */
export const CreateNewValues: Story = {
  render: (args) => ({
    props: {
      ...args,
      teams: [
        { label: 'Design Systems', value: 'ds' },
        { label: 'Platform', value: 'platform' },
        { label: 'Growth', value: 'growth' },
      ] as Options<string>,
      options: [] as Options<string>,
      value: null as string | null,
      onQuery(text: string) {
        const query = text.toLowerCase();
        const matches = (this['teams'] as Options<string>).filter((team) =>
          team.label.toLowerCase().includes(query)
        );
        const exact = matches.some((team) => team.label.toLowerCase() === query);
        this['options'] =
          text && !exact
            ? [
                ...matches,
                { label: `Create "${text}"`, value: `create:${text}`, description: 'New team' },
              ]
            : matches;
      },
      onSelected(option: { label: string; value: string }) {
        if (!option.value.startsWith('create:')) return;
        const name = option.value.slice('create:'.length);
        const created = { label: name, value: name.toLowerCase().replace(/\s+/g, '-') };
        this['teams'] = [...(this['teams'] as Options<string>), created];
        this['options'] = [created];
        this['value'] = created.value;
      },
    },
    template: `
      <uni-combobox
        label="Team"
        placeholder="Choose or create a team"
        emptyText="No teams"
        [filterLocally]="false"
        [options]="options"
        [(value)]="value"
        (query)="onQuery($event)"
        (selected)="onSelected($event)"
      />
    `,
  }),
};

/** The error chrome renders only after interaction — invalid && (touched || dirty). */
export const Invalid: Story = {
  args: { required: true, invalid: true, touched: true },
};

export const Disabled: Story = {
  args: { value: 'Colorado', disabled: true },
};
