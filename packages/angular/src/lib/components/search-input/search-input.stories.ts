import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UniSearchInputComponent as Search } from './search-input.component';
import { UniBoxDirective } from '../layout';

type StoryType = Search;

const SUGGESTIONS = [
  'oklch color engine',
  'ok computer',
  'okta integration',
  'theme tokens',
  'theme builder',
  'typography scale',
];

const meta: Meta<StoryType> = {
  title: 'Components/Forms/Search Input',
  component: Search,
  decorators: [moduleMetadata({ imports: [UniBoxDirective] })],
  argTypes: {
    label: { control: 'text', description: 'Accessible name; placeholder fallback.' },
    placeholder: { control: 'text', description: 'Placeholder override.' },
    debounceTime: { control: 'number', description: 'Pause before `change` emits. Default: 400ms' },
    suggestions: {
      control: 'object',
      description: 'Type-ahead entries; refresh them from `change` emissions.',
    },
    width: { control: 'text', description: "Field width. Default: '100%'" },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: { label: 'Search' },
};

export const TypeAhead: Story = {
  name: 'Type-ahead',
  render: () => ({
    props: {
      all: SUGGESTIONS,
      suggestions: [] as string[],
      filter(query: string) {
        this.suggestions = query
          ? this.all.filter((s: string) => s.toLowerCase().includes(query.toLowerCase()))
          : [];
      },
      log(value: string) {
        console.log('search:', value);
      },
    },
    template: `
      <div box-layout maxWidth="420px">
        <uni-search-input
          label="Search the docs"
          [debounceTime]="200"
          [suggestions]="suggestions"
          (change)="filter($event)"
          (search)="log($event)"
        ></uni-search-input>
      </div>
    `,
  }),
};
