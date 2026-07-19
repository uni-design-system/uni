import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { starWarsCharacters } from '../../../stories/data/star-wars-characters';
import { UniRecordDatasource } from '../../cdk';
import { UniDataSearchComponent as DataSearch } from './data-search.component';

type StoryType = DataSearch<any>;

const meta: Meta<StoryType> = {
  title: 'Components/Data Search',
  component: DataSearch,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <uni-data-search ${argsToTemplate(props)} />
        <div style="margin-top: 16px;">
          @for (record of datasource.records(); track record.id) {
            <div>{{ record.name }} — {{ record.homeworld }}</div>
          }
        </div>
      `,
    };
  },
  argTypes: {
    datasource: {
      description: 'The UniDatasource instance to filter as the user types.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input. Default: "Search".',
    },
    fields: {
      control: 'object',
      description:
        'Optional list of record fields to search. When omitted, all fields are searched (client-side) or a generic "search" filter is sent (server-side).',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    datasource: new UniRecordDatasource<any>(starWarsCharacters.slice(0, 10)),
    placeholder: 'Search characters',
  },
};

export const FieldScoped: Story = {
  args: {
    datasource: new UniRecordDatasource<any>(starWarsCharacters.slice(0, 10)),
    placeholder: 'Search by name only',
    fields: ['name'],
  },
};
