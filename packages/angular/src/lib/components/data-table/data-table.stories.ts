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
import { JsonPipe } from '@angular/common';
import { UniButtonComponent } from '../button/button.component';
import { UniBoxDirective, UniRowDirective } from '../layout';
import { UniPaginatorComponent } from '../paginator/paginator.component';
import { UniTextDirective } from '../text/text.directive';
import { UniDataTableComponent as DataTable } from './data-table.component';

type StoryType = DataTable<any>;

const meta: Meta<StoryType> = {
  title: 'Components/Data Display/Data Table',
  component: DataTable,
  decorators: [
    moduleMetadata({
      imports: [
        JsonPipe,
        UniBoxDirective,
        UniButtonComponent,
        UniRowDirective,
        UniPaginatorComponent,
        UniTextDirective,
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
        'Defines the columns to be displayed in the table: columnDef, header, and optionally cell, template, textAlign, width, sortable (default true) and isSticky.',
    },
    datasource: {
      description:
        'The data source for the table. Should be an instance of UniDatasource containing the data to be displayed.',
    },

    // Behavior
    useMultiSelect: {
      description:
        "Draw a leading checkbox column over the datasource's selections: a select-all header box (indeterminate while only some rows are selected) and a box per row. Default is false.",
    },
    selectableWhen: {
      description:
        'Which rows may be selected; the rest render a disabled box and are skipped by select-all.',
    },
    selectLabel: {
      description: "Accessible name of a row's checkbox, or a function naming it per row. Default 'Select row'.",
    },
    selectAllLabel: { description: "Accessible name of the header checkbox. Default 'Select all rows'." },
    expanded: {
      description:
        "Two-way: the expanded row's rowId (its page index when the datasource has none); null collapses all.",
    },
    expandableWhen: {
      description:
        'Which rows have a detail to open; a row that fails it takes no hover affordance and a click on it only emits rowClick.',
    },
    rowClass: { description: 'Extra class per row, e.g. to dim delivered rows.' },
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
      description: 'Sets the height of the table. Can be any valid CSS height value.',
    },

    // Events
    rowSelect: {
      description: "Event emitted when a row's checkbox toggles it.",
      action: 'rowSelect',
    },
    selectionChange: {
      description: "The datasource's selection after a checkbox changed it.",
      action: 'selectionChange',
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
      <uni-data-table ${argsToTemplate(props)} #dataTable>
        <div row-layout ngProjectAs="data-table-header" justifyContent="space-between">
          <span uni-text>Data Table</span>
          <uni-paginator [datasource]="dataTable.datasource()" [initPageSize]="10" [showPageSize]="true" [showPageJumper]="true" [showPageNumbers]="false" />
        </div>
        <div row-layout ngProjectAs="data-table-footer" justifyContent="center">
          <uni-paginator [datasource]="dataTable.datasource()" [showPageSize]="false" [showPageJumper]="false" [showPageNumbers]="true" />
        </div>
      </uni-data-table>
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
      <uni-data-table ${argsToTemplate(props)}>
        <div box-layout ngProjectAs="data-table-header">Data Table Header</div>
      </uni-data-table>
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
      <uni-data-table ${argsToTemplate(props)} #dataTable>
        <div row-layout ngProjectAs="data-table-header" justifyContent="space-between">
          <div box-layout ngProjectAs="data-table-header">Data Table Header</div>
          <uni-data-search [datasource]="dataTable.datasource()" [fields]="['name', 'homeworld']"></uni-data-search>
        </div>
      </uni-data-table>
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
      <uni-data-table ${argsToTemplate(props)} #dataTable [detailRowTemplate]="detailRowTemplate">
        <div row-layout ngProjectAs="data-table-header" justifyContent="space-between">
          <div box-layout ngProjectAs="data-table-header">Data Table Header</div>
          <uni-data-search [datasource]="dataTable.datasource()" [fields]="['name', 'homeworld']"></uni-data-search>
        </div>
      </uni-data-table>
      <ng-template #detailRowTemplate let-record>
        <div>
          <p>Detail for {{ record.name }}</p>
        </div>
      </ng-template>
      `,
    };
  },
};

/**
 * Column options: `width` steadies a column while a search narrows the rows,
 * `sortable: false` renders a plain heading, and a cell template reads the
 * whole row through `let-row`. In a right-aligned column the sort arrow sits
 * on the leading side of the label, so a right-aligned last column never
 * pushes past the table's edge.
 */
export const ColumnOptions: Story = {
  render: () => ({
    props: {
      datasource: new UniRecordDatasource<any>(starWarsCharacters.slice(0, 6)),
      base: [
        { columnDef: 'species', header: 'Species', textAlign: 'left', sortable: false },
        { columnDef: 'height', header: 'Height', textAlign: 'right' },
      ],
    },
    template: `
      <ng-template #nameCell let-row let-index="index">
        <div box-layout padding="sm" uni-text="title-small">{{ index + 1 }}. {{ row.name }}</div>
      </ng-template>
      <uni-data-table
        [datasource]="datasource"
        [useRowClick]="false"
        [columns]="[
          { columnDef: 'name', header: 'Name', textAlign: 'left', width: '50%', template: nameCell },
          base[0],
          base[1]
        ]"
      />
    `,
  }),
};

type Order = { id: string; item: string; vendor: string; status: 'ready' | 'ordered' | 'delivered' };

const ORDERS: Order[] = [
  { id: 'po-104', item: 'Sofa, linen', vendor: 'Hartley & Co', status: 'ready' },
  { id: 'po-105', item: 'Floor lamp', vendor: 'Lumen', status: 'ordered' },
  { id: 'po-106', item: 'Wool rug 8×10', vendor: 'Hartley & Co', status: 'ready' },
  { id: 'po-107', item: 'Side table', vendor: 'Oak Works', status: 'delivered' },
  { id: 'po-108', item: 'Armchair', vendor: 'Hartley & Co', status: 'ready' },
];

/**
 * The selection column, over the datasource's own `selections`. The datasource
 * has a `rowId`, so a selection survives a re-fetch that rebuilds the rows;
 * `selectableWhen` keeps delivered orders out of it, and the header box
 * governs the rest — indeterminate while only some are selected.
 */
export const Selection: Story = {
  render: () => ({
    props: {
      datasource: new UniRecordDatasource<Order>(ORDERS, { rowId: (row) => row.id }),
      columns: [
        { columnDef: 'id', header: 'PO', textAlign: 'left' },
        { columnDef: 'item', header: 'Item', textAlign: 'left' },
        { columnDef: 'vendor', header: 'Vendor', textAlign: 'left' },
        { columnDef: 'status', header: 'Status' },
      ],
      selectable: (row: Order) => row.status !== 'delivered',
      selectLabelOf: (row: Order) => `Select ${row.id}`,
      selected: [] as Order[],
    },
    template: `
      <uni-data-table
        [datasource]="datasource"
        [columns]="columns"
        [useMultiSelect]="true"
        [selectableWhen]="selectable"
        [useRowClick]="false"
        [selectLabel]="selectLabelOf"
        (selectionChange)="selected = $event"
      />
      <p uni-text="body-2">Selected: {{ selected.length ? (selected | json) : 'nothing' }}</p>
    `,
  }),
};

/**
 * The expanded row as a two-way model keyed by `rowId`: open a row from
 * outside (a deep link), keep it open while the table sorts, and gate which
 * rows have a detail at all — a delivered order has nothing to show and takes
 * no affordance. `rowClass` dims it.
 */
export const ExpandedRow: Story = {
  render: () => ({
    props: {
      datasource: new UniRecordDatasource<Order>(ORDERS, { rowId: (row) => row.id }),
      columns: [
        { columnDef: 'id', header: 'PO', textAlign: 'left' },
        { columnDef: 'item', header: 'Item', textAlign: 'left' },
        { columnDef: 'status', header: 'Status' },
      ],
      expanded: 'po-106' as string | number | null,
      expandable: (row: Order) => row.status !== 'delivered',
      dim: (row: Order) => (row.status === 'delivered' ? 'delivered' : ''),
    },
    template: `
      <div row-layout gap="sm" alignItems="center" paddingBottom="sm">
        <button text-button size="sm" variant="secondary" (click)="expanded = 'po-104'">Open po-104</button>
        <button text-button size="sm" variant="ghost" (click)="expanded = null">Collapse</button>
        <span uni-text="body-2">Expanded: {{ expanded ?? 'none' }}</span>
      </div>
      <uni-data-table
        [datasource]="datasource"
        [columns]="columns"
        [detailRowTemplate]="detail"
        [(expanded)]="expanded"
        [expandableWhen]="expandable"
        [rowClass]="dim"
      />
      <ng-template #detail let-row>
        <div box-layout padding="md" uni-text="body-2-long">
          {{ row.item }} from {{ row.vendor }} — tracking and notes would go here.
        </div>
      </ng-template>
    `,
  }),
};
