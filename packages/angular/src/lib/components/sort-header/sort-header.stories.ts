import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { starWarsCharacters } from '../../../stories/data/star-wars-characters';
import { UniRecordDatasource } from '../../cdk';
import { UniTextComponent } from '../text/text.component';
import { UniSortHeaderComponent as SortHeader } from './sort-header.component';

type StoryType = SortHeader<any>;

const meta: Meta<StoryType> = {
  title: 'Components/Sort Header',
  component: SortHeader,
  decorators: [
    moduleMetadata({
      imports: [UniTextComponent],
    }),
  ],
  argTypes: {
    column: {
      description: 'The datasource column this header sorts by.',
    },
    datasource: {
      description: 'The UniDatasource instance whose records are sorted when the header is clicked.',
    },
  },
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <uni-sort-header [datasource]="datasource" [column]="column">
          <Text typeface="title-small">Name</Text>
        </uni-sort-header>
        <div style="margin-top: 16px;">
          @for (record of datasource.records().slice(0, 5); track record.id) {
            <div>{{ record.name }}</div>
          }
        </div>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    column: 'name',
    datasource: new UniRecordDatasource<any>(starWarsCharacters),
  },
};
