import {
  applicationConfig,
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { starWarsCharacters } from '../../../stories/data/star-wars-characters';
import { UniRecordDatasource } from '../../cdk';
import { UniDataSearchComponent } from '../data-search/data-search.component';
import { UniBoxComponent, UniRowComponent } from '../layout';
import { UniPaginatorComponent } from '../paginator/paginator.component';
import { UniTextComponent } from '../text/text.component';
import { UniDataTableComponent as DataTable } from './data-table.component';

type StoryType = DataTable<any>;

const meta: Meta<StoryType> = {
  title: 'Components/Data Table',
  component: DataTable,
  decorators: [
    moduleMetadata({
      imports: [
        UniBoxComponent,
        UniRowComponent,
        UniPaginatorComponent,
        UniTextComponent,
        UniDataSearchComponent,
      ],
    }),
    applicationConfig({
      providers: [],
    }),
  ],
  argTypes: {
    // Core functionality
    columns: {
      description:
        'Defines the columns to be displayed in the table. Each column definition includes columnDef, header, and optional cell renderer function.',
    },
    datasource: {
      description:
        'The data source for the table. Should be an instance of UniDatasource containing the data to be displayed.',
    },

    // Behavior
    useMultiSelect: {
      description:
        'When true, enables multi-selection functionality for rows. Default is false.',
    },
    useRowClick: {
      description:
        'When true, enables click events on rows and applies hover styling. Default is true.',
    },
    highlight: {
      description:
        'A function that determines whether a row should be highlighted. Takes a row data object and returns a boolean.',
    },

    // Styling
    height: {
      description:
        'Sets the height of the table. Can be any valid CSS height value.',
    },

    // Events
    rowSelect: {
      description: 'Event emitted when a row is selected.',
      action: 'rowSelect',
    },
    rowClick: {
      description: 'Event emitted when a row is clicked.',
      action: 'rowClick',
    },
  },
  /*  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: ``,
    };
  },*/
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    columns: [
      {
        columnDef: 'id',
        header: 'ID',
        isSticky: true,
      },
      {
        columnDef: 'name',
        header: 'Name',
        textAlign: 'left',
      },
      {
        columnDef: 'species',
        header: 'Species',
      },
      {
        columnDef: 'height',
        header: 'Height',
        cell: (element: any) => (element.height ? `${element.height} m` : ''),
      },
      {
        columnDef: 'homeworld',
        header: 'Home World',
      },
    ],
    datasource: new UniRecordDatasource<any>(starWarsCharacters),
  },
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
      <DataTable ${argsToTemplate(props)} #dataTable>
        <div row-layout ngProjectAs="data-table-header" justifyContent="space-between">
          <Text>Data Table</Text>
          <uni-paginator [datasource]="dataTable.datasource()" [initPageSize]="10" [showPageSize]="true" [showPageJumper]="true" [showPageNumbers]="false" />
        </div>
        <div row-layout ngProjectAs="data-table-footer" justifyContent="center">
          <uni-paginator [datasource]="dataTable.datasource()" [showPageSize]="false" [showPageJumper]="false" [showPageNumbers]="true" />
        </div>
      </DataTable>
      `,
    };
  },
};

export const WithHeader: Story = {
  args: {
    height: '300px',
    columns: [
      {
        columnDef: 'id',
        header: 'ID',
      },
      {
        columnDef: 'name',
        header: 'Name',
        textAlign: 'left',
      },
      {
        columnDef: 'homeworld',
        header: 'Home World',
      },
    ],
    datasource: new UniRecordDatasource<any>(starWarsCharacters),
  },
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
      <DataTable ${argsToTemplate(props)}>
        <div box-layout ngProjectAs="data-table-header">Data Table Header</div>
      </DataTable>
      `,
    };
  },
};

export const WithSearch: Story = {
  args: {
    height: '300px',
    columns: [
      {
        columnDef: 'id',
        header: 'ID',
      },
      {
        columnDef: 'name',
        header: 'Name',
        textAlign: 'left',
      },
      {
        columnDef: 'homeworld',
        header: 'Home World',
      },
    ],
    datasource: new UniRecordDatasource<any>(starWarsCharacters),
  },
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
      <DataTable ${argsToTemplate(props)} #dataTable>
        <div row-layout ngProjectAs="data-table-header" justifyContent="space-between">
          <div box-layout ngProjectAs="data-table-header">Data Table Header</div>
          <uni-data-search [datasource]="dataTable.datasource()" [fields]="['name', 'homeworld']"></uni-data-search>
        </div>
      </DataTable>
      `,
    };
  },
};

export const WithDetailRow: Story = {
  args: {
    height: '300px',
    columns: [
      {
        columnDef: 'id',
        header: 'ID',
      },
      {
        columnDef: 'name',
        header: 'Name',
        textAlign: 'left',
      },
      {
        columnDef: 'homeworld',
        header: 'Home World',
      },
    ],
    datasource: new UniRecordDatasource<any>(starWarsCharacters),
  },
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
<button (click)="dataTable.toggleRow(1)">Expand</button>
      <DataTable ${argsToTemplate(props)} #dataTable [detailRowTemplate]="detailRowTemplate">
        <div row-layout ngProjectAs="data-table-header" justifyContent="space-between">
          <div box-layout ngProjectAs="data-table-header">Data Table Header</div>
          <uni-data-search [datasource]="dataTable.datasource()" [fields]="['name', 'homeworld']"></uni-data-search>
        </div>
      </DataTable>
      <ng-template #detailRowTemplate let-record>
        <div>
          <p>Detail for {{ record.name }}</p>
        </div>
      </ng-template>
      `,
    };
  },
};
