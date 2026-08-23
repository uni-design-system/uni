import { argsToTemplate, Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { starWarsCharacters } from '../../../stories/data/star-wars-characters';
import { UniRecordDatasource } from '../../cdk';
import { UniPaginatorComponent as Paginator } from './paginator.component';
import { UniBoxDirective } from '../layout';

type StoryType = Paginator<any>;

const meta: Meta<StoryType> = {
  title: 'Components/Data Display/Paginator',
  component: Paginator,
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <uni-paginator ${argsToTemplate(props)} />
        <div box-layout paddingTop="md">
          @for (record of datasource.records(); track record.id) {
            <div>{{ record.name }}</div>
          }
        </div>
      `,
    };
  },
  decorators: [moduleMetadata({ imports: [UniBoxDirective] })],
  argTypes: {
    datasource: {
      description: 'The UniDatasource instance the paginator controls.',
    },
    initPageSize: {
      control: 'number',
      description: 'Initial page size applied to the datasource.',
    },
    showPageSize: {
      control: 'boolean',
      description: 'Shows the "Show n" page-size input.',
    },
    showPageJumper: {
      control: 'boolean',
      description: 'Shows the "Jump to" page input.',
    },
    showPageNumbers: {
      control: 'boolean',
      description: 'Shows first/previous/next/last controls with truncated page numbers.',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    datasource: new UniRecordDatasource<any>(starWarsCharacters),
    initPageSize: 5,
    showPageSize: true,
    showPageJumper: true,
    showPageNumbers: true,
  },
};

export const PageNumbersOnly: Story = {
  args: {
    datasource: new UniRecordDatasource<any>(starWarsCharacters),
    initPageSize: 5,
    showPageSize: false,
    showPageJumper: false,
    showPageNumbers: true,
  },
};
