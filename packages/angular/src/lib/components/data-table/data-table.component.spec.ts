/**
 * First specs for `uni-data-table` — the most complex component in the library
 * and, until now, one with no coverage at all.
 *
 * Driven through a real `UniRecordDatasource`: the table's whole job is to be a
 * reactive view of one, so sorting and paging are asserted by what ends up in
 * the DOM after the datasource moves, not by inspecting inputs.
 */
import { Component, computed, signal, type TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';
import { type RowKey, UniRecordDatasource } from '../../cdk';
import { ThemeService } from '../../theming';
import { emittedRuleFor } from '../../../testing/emitted-css';
import { UniDataTableComponent } from './data-table.component';
import type { ColumnDefinition, UniDataTableCellContext } from './data-table.models';

interface Row {
  name: string;
  qty: number;
}

const ROWS: Row[] = [
  { name: 'Cherry', qty: 3 },
  { name: 'Apple', qty: 9 },
  { name: 'Banana', qty: 1 },
];

const COLUMNS: ColumnDefinition<Row>[] = [
  { columnDef: 'name', header: 'Name' },
  { columnDef: 'qty', header: 'Quantity' },
];

describe('UniDataTableComponent', () => {
  let fixture: ComponentFixture<UniDataTableComponent<Row>>;
  let datasource: UniRecordDatasource<Row>;
  let host: HTMLElement;

  /** Body rows only, skipping the detail rows the template interleaves. */
  const bodyRows = () =>
    Array.from(host.querySelectorAll('tbody tr')).filter((tr) =>
      tr.querySelector('td:not([colspan])')
    );

  const cellText = () =>
    bodyRows().map((tr) =>
      Array.from(tr.querySelectorAll('td')).map((td) => td.textContent?.trim())
    );

  const headers = () => Array.from(host.querySelectorAll('thead th'));

  /** Visible text minus `aria-hidden` parts — the sort arrow is a hidden symbol. */
  const accessibleName = (el: Element) => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
    return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniDataTableComponent] }).compileComponents();
    datasource = new UniRecordDatasource<Row>([...ROWS]);
    fixture = TestBed.createComponent<UniDataTableComponent<Row>>(UniDataTableComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('datasource', datasource);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.detectChanges();
  });

  describe('rendering the datasource', () => {
    it('renders a row per record and a cell per column', () => {
      expect(bodyRows()).toHaveLength(3);
      expect(cellText()).toEqual([
        ['Cherry', '3'],
        ['Apple', '9'],
        ['Banana', '1'],
      ]);
    });

    it('renders a header per column, scoped for assistive tech', () => {
      expect(headers().map(accessibleName)).toEqual(['Name', 'Quantity']);
      expect(headers().every((th) => th.getAttribute('scope') === 'col')).toBe(true);
    });

    it('prefers a column cell accessor over the raw field', () => {
      fixture.componentRef.setInput('columns', [
        { columnDef: 'name', header: 'Name', cell: (row: Row) => row.name.toUpperCase() },
      ] satisfies ColumnDefinition<Row>[]);
      fixture.detectChanges();

      expect(cellText()).toEqual([['CHERRY'], ['APPLE'], ['BANANA']]);
    });

    it('follows the datasource when it sorts', () => {
      datasource.sortRecords({ column: 'name', direction: 'asc' });
      fixture.detectChanges();

      expect(cellText().map((row) => row[0])).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    it('follows the datasource when it pages', () => {
      datasource.setPageSize(2);
      fixture.detectChanges();
      expect(bodyRows()).toHaveLength(2);

      datasource.nextPage();
      fixture.detectChanges();
      expect(cellText()).toEqual([['Banana', '1']]);
    });

    it('renders an empty body rather than breaking on no records', () => {
      datasource.initialRecords.set([]);
      fixture.detectChanges();

      expect(bodyRows()).toHaveLength(0);
      expect(headers()).toHaveLength(2);
    });
  });

  describe('sort state on the headers', () => {
    it('announces no sort until one is applied', () => {
      expect(headers().map((th) => th.getAttribute('aria-sort'))).toEqual([null, null]);
    });

    it('announces the direction on the sorted column only', () => {
      datasource.sortRecords({ column: 'name', direction: 'asc' });
      fixture.detectChanges();
      expect(headers().map((th) => th.getAttribute('aria-sort'))).toEqual(['ascending', null]);

      datasource.sortRecords({ column: 'name', direction: 'desc' });
      fixture.detectChanges();
      expect(headers().map((th) => th.getAttribute('aria-sort'))).toEqual(['descending', null]);
    });

    it('drops back to no announcement when the sort is cleared', () => {
      datasource.sortRecords({ column: 'name', direction: 'indet' });
      fixture.detectChanges();

      // `indet` is a real state in the cycle, and it means unsorted — not
      // "sorted in an indeterminate direction".
      expect(headers()[0].getAttribute('aria-sort')).toBeNull();
    });

    it('sorts from the header, through the embedded sort header', () => {
      headers()[0].querySelector('button')!.click();
      fixture.detectChanges();

      expect(datasource.sortColumn()).toBe('name');
      expect(cellText().map((row) => row[0])).toEqual(['Apple', 'Banana', 'Cherry']);
    });
  });

  describe('row interaction', () => {
    it('emits the clicked row', () => {
      const clicked: Row[] = [];
      fixture.componentInstance.rowClick.subscribe((row) => clicked.push(row));

      (bodyRows()[1] as HTMLElement).click();
      fixture.detectChanges();

      expect(clicked).toEqual([{ name: 'Apple', qty: 9 }]);
    });

    it('makes rows keyboard-reachable while row clicking is on', () => {
      expect(bodyRows().every((tr) => tr.getAttribute('tabindex') === '0')).toBe(true);

      fixture.componentRef.setInput('useRowClick', false);
      fixture.detectChanges();
      expect(bodyRows().every((tr) => tr.getAttribute('tabindex') === null)).toBe(true);
    });

    it('highlights the rows the callback picks out', () => {
      fixture.componentRef.setInput('highlight', (row: Row) => row.qty > 5);
      fixture.detectChanges();

      expect(fixture.componentInstance.isHighlighted(ROWS[1])).toBe(true);
      expect(fixture.componentInstance.isHighlighted(ROWS[0])).toBe(false);
    });

    it('treats no highlight callback as nothing highlighted', () => {
      expect(fixture.componentInstance.isHighlighted(ROWS[0])).toBe(false);
    });
  });

  describe('detail rows', () => {
    it('renders none at all when no template is given', () => {
      expect(host.querySelectorAll('td[colspan]')).toHaveLength(0);
    });
  });

  describe('loading', () => {
    it('marks the region busy and offers a status while loading', () => {
      fixture.componentInstance.isLoading.set(true);
      fixture.detectChanges();

      expect(host.querySelector('[aria-busy="true"]')).not.toBeNull();
      expect(host.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('Loading');
    });

    it('is not busy for a client-side datasource', () => {
      expect(host.querySelector('[aria-busy="true"]')).toBeNull();
    });
  });
});

describe('UniDataTableComponent columns', () => {
  let fixture: ComponentFixture<UniDataTableComponent<Row>>;
  let host: HTMLElement;

  const headers = () => Array.from(host.querySelectorAll<HTMLElement>('thead th'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniDataTableComponent] }).compileComponents();
    fixture = TestBed.createComponent<UniDataTableComponent<Row>>(UniDataTableComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('datasource', new UniRecordDatasource<Row>([...ROWS]));
    fixture.componentRef.setInput('columns', [
      { columnDef: 'name', header: 'Name', width: '240px', sortable: false },
      { columnDef: 'qty', header: 'Quantity', textAlign: 'right' },
    ] satisfies ColumnDefinition<Row>[]);
    fixture.detectChanges();
  });

  it('applies a column width to its header cell', () => {
    expect(headers()[0].style.width).toBe('240px');
    expect(headers()[1].style.width).toBe('');
  });

  it('renders a non-sortable heading as plain text, with no button', () => {
    expect(headers()[0].querySelector('button')).toBeNull();
    expect(headers()[0].textContent?.trim()).toBe('Name');
    expect(headers()[1].querySelector('button')).not.toBeNull();
  });

  it('puts the sort arrow on the leading side of a right-aligned column', () => {
    const icon = headers()[1].querySelector('.sort-icon')!;

    expect(getComputedStyle(icon).left).toBe('-24px');
  });

  it('clips header overflow so the arrow cannot widen the scroll area', () => {
    expect(getComputedStyle(headers()[1]).overflow).toBe('hidden');
  });
});

@Component({
  imports: [UniDataTableComponent],
  template: `
    <ng-template #cell let-row let-index="index" let-qty="qty">
      <span class="cell">{{ index }}:{{ row.name }}:{{ qty }}</span>
    </ng-template>
    <uni-data-table [datasource]="datasource" [columns]="columns()" />
  `,
})
class CellHost {
  readonly datasource = new UniRecordDatasource<Row>([...ROWS]);
  private readonly cell = viewChild.required<TemplateRef<UniDataTableCellContext<Row>>>('cell');
  readonly columns = computed<ColumnDefinition<Row>[]>(() => [
    { columnDef: 'name', header: 'Name', template: this.cell() },
  ]);
}

describe('UniDataTableComponent cell templates', () => {
  it('gives the template the row, its index and its fields by name', async () => {
    await TestBed.configureTestingModule({ imports: [CellHost] }).compileComponents();
    const fixture = TestBed.createComponent(CellHost);
    fixture.detectChanges();
    const cells = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.cell'));

    expect(cells.map((cell) => cell.textContent?.trim())).toEqual([
      '0:Cherry:3',
      '1:Apple:9',
      '2:Banana:1',
    ]);
  });
});

@Component({
  imports: [UniDataTableComponent],
  template: `
    <ng-template #detail let-row>
      <span class="detail">More about {{ row.name }}</span>
    </ng-template>
    <uni-data-table [datasource]="datasource" [columns]="columns" [detailRowTemplate]="detail" />
  `,
})
class DetailHost {
  readonly datasource = new UniRecordDatasource<Row>([...ROWS]);
  readonly columns = COLUMNS;
}

/**
 * A detail row is rendered for every record and kept `inert` until expanded,
 * so a collapsed one is neither focusable nor announced — the alternative,
 * hiding it with CSS alone, leaves it in the accessibility tree.
 */
describe('UniDataTableComponent detail rows', () => {
  let fixture: ComponentFixture<DetailHost>;
  let host: HTMLElement;

  const detailRows = () =>
    Array.from(host.querySelectorAll('td[colspan]')).map((td) => td.closest('tr')!);
  const recordRows = () =>
    Array.from(host.querySelectorAll('tbody tr')).filter((tr) => !tr.querySelector('td[colspan]'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DetailHost] }).compileComponents();
    fixture = TestBed.createComponent(DetailHost);
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders one detail row per record, spanning every column', () => {
    expect(detailRows()).toHaveLength(3);
    expect(detailRows()[0].querySelector('td')!.getAttribute('colspan')).toBe('2');
  });

  it('renders the projected template against its own record', () => {
    expect(detailRows()[1].querySelector('.detail')?.textContent).toContain('More about Apple');
  });

  it('keeps every detail row inert while collapsed', () => {
    expect(detailRows().every((tr) => tr.hasAttribute('inert'))).toBe(true);
  });

  it('expands the clicked row, and only that row', () => {
    (recordRows()[1] as HTMLElement).click();
    fixture.detectChanges();

    expect(detailRows()[1].hasAttribute('inert')).toBe(false);
    expect(detailRows()[1].classList).toContain('expanded');
    expect(detailRows()[0].hasAttribute('inert')).toBe(true);
  });

  it('collapses again on a second click', () => {
    (recordRows()[1] as HTMLElement).click();
    fixture.detectChanges();
    (recordRows()[1] as HTMLElement).click();
    fixture.detectChanges();

    expect(detailRows()[1].hasAttribute('inert')).toBe(true);
  });

  it('moves the expansion when a different row is clicked', () => {
    (recordRows()[0] as HTMLElement).click();
    fixture.detectChanges();
    (recordRows()[2] as HTMLElement).click();
    fixture.detectChanges();

    expect(detailRows()[0].hasAttribute('inert')).toBe(true);
    expect(detailRows()[2].hasAttribute('inert')).toBe(false);
  });
});

interface Order {
  id: string;
  item: string;
  status: 'ready' | 'delivered';
}

const ORDERS: Order[] = [
  { id: 'o1', item: 'Sofa', status: 'ready' },
  { id: 'o2', item: 'Lamp', status: 'delivered' },
  { id: 'o3', item: 'Rug', status: 'ready' },
];

const ORDER_COLUMNS: ColumnDefinition<Order>[] = [
  { columnDef: 'item', header: 'Item' },
  { columnDef: 'status', header: 'Status' },
];

/**
 * The selection column: `useMultiSelect` used to be read nowhere. It now
 * draws a checkbox column over the datasource's own `selections`, so a
 * consumer no longer has to keep a second table alive for a select column.
 */
describe('UniDataTableComponent selection', () => {
  let fixture: ComponentFixture<UniDataTableComponent<Order>>;
  let datasource: UniRecordDatasource<Order>;
  let host: HTMLElement;

  const headerBox = () => host.querySelector<HTMLElement>('thead uni-checkbox')!;
  const headerInput = () => headerBox().querySelector('input')!;
  const rowBoxes = () => Array.from(host.querySelectorAll<HTMLElement>('tbody uni-checkbox'));
  const rowInputs = () => rowBoxes().map((box) => box.querySelector('input')!);
  const bodyRows = () =>
    Array.from(host.querySelectorAll<HTMLElement>('tbody tr')).filter((tr) =>
      tr.querySelector('td:not([colspan])')
    );
  const tick = (input: HTMLInputElement) => {
    input.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniDataTableComponent] }).compileComponents();
    datasource = new UniRecordDatasource<Order>([...ORDERS], { rowId: (row) => row.id });
    fixture = TestBed.createComponent<UniDataTableComponent<Order>>(UniDataTableComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('datasource', datasource);
    fixture.componentRef.setInput('columns', ORDER_COLUMNS);
    fixture.componentRef.setInput('useMultiSelect', true);
    fixture.detectChanges();
  });

  it('draws nothing without useMultiSelect, as before', () => {
    fixture.componentRef.setInput('useMultiSelect', false);
    fixture.detectChanges();
    expect(host.querySelector('uni-checkbox')).toBeNull();
    expect(host.querySelectorAll('thead th')).toHaveLength(2);
  });

  it('draws a leading checkbox column: one in the header, one per row, named without drawing', () => {
    expect(host.querySelectorAll('thead th')).toHaveLength(3);
    expect(headerBox().textContent?.trim()).toBe('Select all rows');
    expect(rowBoxes()).toHaveLength(3);
    expect(rowBoxes()[0].textContent?.trim()).toBe('Select row');
    expect(bodyRows()[0].querySelectorAll('td')).toHaveLength(3);
  });

  it('states the column width on the header cell, so the slack goes to the data columns', () => {
    expect(host.querySelector<HTMLElement>('thead th')!.style.width).toBe('40px');
  });

  it('names each row box per row through a selectLabel function', () => {
    fixture.componentRef.setInput('selectLabel', (row: Order) => `Select ${row.item}`);
    fixture.detectChanges();
    expect(rowBoxes().map((box) => box.textContent?.trim())).toEqual([
      'Select Sofa',
      'Select Lamp',
      'Select Rug',
    ]);
  });

  it('a row box toggles the datasource selection and reports it', () => {
    const changes: Order[][] = [];
    fixture.componentInstance.selectionChange.subscribe((rows) => changes.push(rows));

    tick(rowInputs()[0]);
    expect(datasource.isSelected(ORDERS[0])).toBe(true);
    expect(changes).toEqual([[ORDERS[0]]]);
    expect(bodyRows()[0].classList).toContain('selected');

    tick(rowInputs()[0]);
    expect(datasource.selections()).toEqual([]);
  });

  it('reflects a selection made from outside the table', () => {
    datasource.toggleSelection(ORDERS[2]);
    fixture.detectChanges();
    expect(rowInputs()[2].checked).toBe(true);
    expect(rowInputs()[0].checked).toBe(false);
  });

  it('the header box is indeterminate with some selected, checked with all, and toggles every selectable row', () => {
    tick(rowInputs()[0]);
    expect(headerInput().indeterminate).toBe(true);
    expect(headerInput().checked).toBe(false);

    tick(headerInput());
    expect(datasource.selections().map((row) => row.id)).toEqual(['o1', 'o2', 'o3']);
    expect(headerInput().checked).toBe(true);
    expect(headerInput().indeterminate).toBe(false);

    tick(headerInput());
    expect(datasource.selections()).toEqual([]);
  });

  it('a box click is not a row click', () => {
    const clicked: Order[] = [];
    fixture.componentInstance.rowClick.subscribe((row) => clicked.push(row));
    tick(rowInputs()[1]);
    expect(clicked).toEqual([]);
    expect(fixture.componentInstance.expanded()).toBeNull();
  });

  describe('selectableWhen', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('selectableWhen', (row: Order) => row.status === 'ready');
      fixture.detectChanges();
    });

    it('disables the box of a row that may not be selected', () => {
      expect(rowInputs().map((input) => input.disabled)).toEqual([false, true, false]);
    });

    it('select-all selects only the selectable rows, and reads as all once they are', () => {
      tick(headerInput());
      expect(datasource.selections().map((row) => row.id)).toEqual(['o1', 'o3']);
      expect(headerInput().checked).toBe(true);
      expect(headerInput().indeterminate).toBe(false);
    });

    it('disables the header box when nothing on the page may be selected', () => {
      fixture.componentRef.setInput('selectableWhen', () => false);
      fixture.detectChanges();
      expect(headerInput().disabled).toBe(true);
    });
  });

  it('keeps the selection across a re-fetch with equal ids', () => {
    tick(rowInputs()[0]);
    datasource.initialRecords.set(ORDERS.map((row) => ({ ...row })));
    fixture.detectChanges();

    expect(rowInputs()[0].checked).toBe(true);
    expect(bodyRows()[0].classList).toContain('selected');
  });

  it('spans the selection column with the detail row', async () => {
    const { fixture: f, host: h } = await renderKeyedDetail({ useMultiSelect: true });
    expect(h.querySelector('td[colspan]')!.getAttribute('colspan')).toBe('3');
    f.destroy();
  });

  it('tints a selected row from the theme option', () => {
    TestBed.inject(ThemeService).registerTheme(
      createTheme({
        id: 'Tinted',
        name: 'Tinted',
        colors: LightTheme.colors,
        components: { dataTable: { options: { selectedRowColor: 'primary-container' } } },
      }),
      { select: true }
    );
    tick(rowInputs()[0]);
    // `emittedRuleFor` strips whitespace.
    expect(emittedRuleFor(bodyRows()[0])).toMatch(/\.selectedtd\{background-color/);
  });
});

@Component({
  imports: [UniDataTableComponent],
  template: `
    <ng-template #detail let-row>
      <span class="detail">More about {{ row.item }}</span>
    </ng-template>
    <uni-data-table
      [datasource]="datasource"
      [columns]="columns"
      [detailRowTemplate]="detail"
      [useMultiSelect]="useMultiSelect()"
      [expandableWhen]="expandableWhen()"
      [rowClass]="rowClass()"
      [(expanded)]="expanded"
    />
  `,
})
class KeyedDetailHost {
  readonly datasource = new UniRecordDatasource<Order>([...ORDERS], { rowId: (row) => row.id });
  readonly columns = ORDER_COLUMNS;
  readonly useMultiSelect = signal(false);
  readonly expandableWhen = signal<((row: Order) => boolean) | undefined>(undefined);
  readonly rowClass = signal<((row: Order) => string) | undefined>(undefined);
  readonly expanded = signal<RowKey | null>(null);
}

async function renderKeyedDetail(inputs: { useMultiSelect?: boolean } = {}) {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({ imports: [KeyedDetailHost] }).compileComponents();
  const fixture = TestBed.createComponent(KeyedDetailHost);
  if (inputs.useMultiSelect) fixture.componentInstance.useMultiSelect.set(true);
  fixture.detectChanges();
  return { fixture, host: fixture.nativeElement as HTMLElement };
}

/**
 * Expansion keyed by `rowId`: the expanded row used to be an internal page
 * index, so a consumer could not open a row, close all rows, or keep one open
 * across a sort or a re-fetch that reordered the records.
 */
describe('UniDataTableComponent expanded model', () => {
  let fixture: ComponentFixture<KeyedDetailHost>;
  let host: HTMLElement;

  const recordRows = () =>
    Array.from(host.querySelectorAll<HTMLElement>('tbody tr')).filter(
      (tr) => !tr.querySelector('td[colspan]')
    );
  const openDetails = () =>
    Array.from(host.querySelectorAll('td[colspan]'))
      .map((td) => td.closest('tr')!)
      .filter((tr) => !tr.hasAttribute('inert'))
      .map((tr) => tr.querySelector('.detail')?.textContent?.trim());

  beforeEach(async () => {
    ({ fixture, host } = await renderKeyedDetail());
  });

  it('opens the row the consumer names, by id', () => {
    fixture.componentInstance.expanded.set('o3');
    fixture.detectChanges();
    expect(openDetails()).toEqual(['More about Rug']);
    expect(recordRows()[2].getAttribute('aria-expanded')).toBe('true');
    expect(recordRows()[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('reports the clicked row by id through the model', () => {
    recordRows()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded()).toBe('o2');

    recordRows()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded()).toBeNull();
  });

  it('keeps the same record open through a sort that moves it', () => {
    fixture.componentInstance.expanded.set('o2');
    fixture.componentInstance.datasource.sortRecords({ column: 'item', direction: 'asc' });
    fixture.detectChanges();

    // Lamp sorted first; still the open one.
    expect(recordRows()[0].textContent).toContain('Lamp');
    expect(openDetails()).toEqual(['More about Lamp']);
  });

  it('keeps the same record open across a re-fetch with equal ids', () => {
    fixture.componentInstance.expanded.set('o1');
    fixture.detectChanges();
    fixture.componentInstance.datasource.initialRecords.set(ORDERS.map((row) => ({ ...row })));
    fixture.detectChanges();
    expect(openDetails()).toEqual(['More about Sofa']);
  });

  it('null collapses every row', () => {
    fixture.componentInstance.expanded.set('o1');
    fixture.detectChanges();
    fixture.componentInstance.expanded.set(null);
    fixture.detectChanges();
    expect(openDetails()).toEqual([]);
  });

  it('exposes the page index of the open row through the deprecated expandedIndex', () => {
    const table = fixture.debugElement.query((el) => el.name === 'uni-data-table')
      .componentInstance as UniDataTableComponent<Order>;
    fixture.componentInstance.expanded.set('o3');
    fixture.detectChanges();
    expect(table.expandedIndex()).toBe(2);
    expect(table.toggleRow).toBeTypeOf('function');
  });

  describe('expandableWhen', () => {
    beforeEach(() => {
      fixture.componentInstance.expandableWhen.set((row) => row.status === 'ready');
      fixture.detectChanges();
    });

    it('a row with no detail takes no affordance and no aria-expanded', () => {
      expect(recordRows()[1].classList).toContain('inexpandable');
      expect(recordRows()[1].getAttribute('aria-expanded')).toBeNull();
      expect(recordRows()[0].classList).not.toContain('inexpandable');
      expect(recordRows()[0].getAttribute('aria-expanded')).toBe('false');
    });

    it('a click on it still emits rowClick but opens nothing', () => {
      const table = fixture.debugElement.query((el) => el.name === 'uni-data-table')
        .componentInstance as UniDataTableComponent<Order>;
      const clicked: Order[] = [];
      table.rowClick.subscribe((row) => clicked.push(row));

      recordRows()[1].click();
      fixture.detectChanges();
      expect(clicked).toEqual([ORDERS[1]]);
      expect(fixture.componentInstance.expanded()).toBeNull();
    });

    it('keeps the hover affordance off an inexpandable row', () => {
      expect(emittedRuleFor(recordRows()[0])).toContain(':not(.inexpandable):hovertd');
    });
  });

  it('adds the consumer rowClass to the row', () => {
    fixture.componentInstance.rowClass.set((row) => (row.status === 'delivered' ? 'dim' : ''));
    fixture.detectChanges();
    expect(recordRows()[1].classList).toContain('dim');
    expect(recordRows()[0].classList).not.toContain('dim');
  });
});

/** Without a `rowId` the expanded key is the page index, as the old signal was. */
describe('UniDataTableComponent expanded without a rowId', () => {
  it('keys by page index', async () => {
    await TestBed.configureTestingModule({ imports: [DetailHost] }).compileComponents();
    const fixture = TestBed.createComponent(DetailHost);
    fixture.detectChanges();
    const table = fixture.debugElement.query((el) => el.name === 'uni-data-table')
      .componentInstance as UniDataTableComponent<Row>;
    const rows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('tbody tr')
    ).filter((tr) => !tr.querySelector('td[colspan]'));

    rows[2].click();
    fixture.detectChanges();
    expect(table.expanded()).toBe(2);
    expect(table.expandedIndex()).toBe(2);
  });
});
