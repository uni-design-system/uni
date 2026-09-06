/**
 * First specs for `uni-sort-header` — it shipped with none, and it is the only
 * thing standing between a column heading and the datasource's sort state.
 *
 * Driven through a real `UniRecordDatasource` rather than a stub: the point of
 * the component is the round trip (click → `sortRecords` → reordered
 * `records()` → new `direction()`), and a hand-written double would assert the
 * call rather than the outcome.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniRecordDatasource } from '../../cdk';
import { UniSortHeaderComponent } from './sort-header.component';

interface Row {
  name: string;
  qty: number;
}

describe('UniSortHeaderComponent', () => {
  let fixture: ComponentFixture<UniSortHeaderComponent<Row>>;
  let datasource: UniRecordDatasource<Row>;

  const ROWS: Row[] = [
    { name: 'Cherry', qty: 3 },
    { name: 'Apple', qty: 9 },
    { name: 'Banana', qty: 1 },
  ];

  const button = () => (fixture.nativeElement as HTMLElement).querySelector('button')!;
  const click = () => {
    button().click();
    fixture.detectChanges();
  };
  const names = () => datasource.records().map((row) => row.name);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniSortHeaderComponent] }).compileComponents();
    datasource = new UniRecordDatasource<Row>([...ROWS]);
    fixture = TestBed.createComponent<UniSortHeaderComponent<Row>>(UniSortHeaderComponent);
    fixture.componentRef.setInput('datasource', datasource);
    fixture.componentRef.setInput('column', 'name');
    fixture.detectChanges();
  });

  it('starts unsorted', () => {
    expect(fixture.componentInstance.direction()).toBe('indet');
    expect(names()).toEqual(['Cherry', 'Apple', 'Banana']);
  });

  it('cycles ascending, descending, unsorted, and round again', () => {
    click();
    expect(fixture.componentInstance.direction()).toBe('asc');

    click();
    expect(fixture.componentInstance.direction()).toBe('desc');

    click();
    expect(fixture.componentInstance.direction()).toBe('indet');

    click();
    expect(fixture.componentInstance.direction()).toBe('asc');
  });

  it('actually reorders the datasource, not just its own state', () => {
    click();
    expect(names()).toEqual(['Apple', 'Banana', 'Cherry']);

    click();
    expect(names()).toEqual(['Cherry', 'Banana', 'Apple']);

    // Back to unsorted restores the datasource's original order.
    click();
    expect(names()).toEqual(['Cherry', 'Apple', 'Banana']);
  });

  it('sorts numbers numerically rather than as strings', () => {
    fixture.componentRef.setInput('column', 'qty');
    fixture.detectChanges();
    click();

    expect(datasource.records().map((row) => row.qty)).toEqual([1, 3, 9]);
  });

  it('writes its own column into the shared sort state', () => {
    click();

    expect(datasource.sortColumn()).toBe('name');
    expect(datasource.sortDirection()).toBe('asc');
  });

  it('reads as unsorted while another column owns the sort', () => {
    // Every header shares one datasource, so a header must not show an arrow
    // for a sort belonging to a different column.
    datasource.sortRecords({ column: 'qty', direction: 'asc' });
    fixture.detectChanges();

    expect(fixture.componentInstance.direction()).toBe('indet');
  });

  it('sorts from a real button, so Enter and Space work without extra handlers', () => {
    expect(button().tagName).toBe('BUTTON');
    expect(button().getAttribute('type')).toBe('button');
  });

  it('reflects the direction onto the icon, which is what the arrow rotates on', () => {
    const icon = () => (fixture.nativeElement as HTMLElement).querySelector('.sort-icon')!;
    expect(icon().classList).toContain('indet');

    click();
    expect(icon().classList).toContain('asc');
  });

  it('does nothing at all without a datasource', () => {
    fixture.componentRef.setInput('datasource', undefined);
    fixture.detectChanges();

    expect(() => click()).not.toThrow();
    expect(fixture.componentInstance.direction()).toBe('indet');
  });
});
