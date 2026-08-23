import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { starWarsCharacters } from '../../../stories/data/star-wars-characters';
import { UniRecordDatasource } from '../../cdk';
import { UniTextDirective } from '../text/text.directive';
import { UniSortHeaderComponent as SortHeader } from './sort-header.component';
import { UniBoxDirective } from '../layout';

type StoryType = SortHeader<any>;

const meta: Meta<StoryType> = {
  title: 'Components/Data Display/Sort Header',
  component: SortHeader,
  decorators: [
    moduleMetadata({
      imports: [UniBoxDirective, UniTextDirective],
    }),
  ],
  argTypes: {
    column: {
      description: 'The datasource column this header sorts by.',
    },
    datasource: {
      description:
        'The UniDatasource instance whose records are sorted when the header is clicked.',
    },
  },
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <uni-sort-header [datasource]="datasource" [column]="column">
          <span uni-text="title-small">Name</span>
        </uni-sort-header>
        <div box-layout paddingTop="md">
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
