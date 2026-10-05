/**
 * First specs for `uni-data-table` — the most complex component in the library
 * and, until now, one with no coverage at all.
 *
 * Driven through a real `UniRecordDatasource`: the table's whole job is to be a
 * reactive view of one, so sorting and paging are asserted by what ends up in
 * the DOM after the datasource moves, not by inspecting inputs.
 */
import { Component, computed, type TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniRecordDatasource } from '../../cdk';
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
