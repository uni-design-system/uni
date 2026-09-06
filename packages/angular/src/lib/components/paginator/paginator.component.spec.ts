/**
 * First specs for `uni-paginator` — it shipped with none, despite being pure
 * datasource choreography: every control here is a thin wrapper over a
 * `UniDatasource` method, and the disabled states come from the datasource's
 * computeds rather than from the component.
 *
 * Driven through a real `UniRecordDatasource` so the assertions are about what
 * the user ends up looking at (`records()`, `pageIndex()`), not about which
 * method was called.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniRecordDatasource } from '../../cdk';
import { UniPaginatorComponent } from './paginator.component';

interface Row {
  id: number;
}

describe('UniPaginatorComponent', () => {
  let fixture: ComponentFixture<UniPaginatorComponent<Row>>;
  let datasource: UniRecordDatasource<Row>;
  let host: HTMLElement;

  /** 25 rows at 10 a page = 3 pages, the smallest set that exercises truncation. */
  const ROWS: Row[] = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

  /**
   * Accessible name: visible text minus `aria-hidden` parts. The stepper
   * buttons are icon buttons — their glyph is an `aria-hidden` `uni-symbol`
   * and their real name is the visually-hidden label — so raw `textContent`
   * reads "keyboard_double_arrow_left First Page".
   */
  const accessibleName = (el: Element) => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
    return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
  };

  const buttonNamed = (name: string) =>
    Array.from(host.querySelectorAll('button')).find(
      (b) => accessibleName(b) === name || b.getAttribute('aria-label') === name
    )!;

  const click = (name: string) => {
    buttonNamed(name).click();
    fixture.detectChanges();
  };

  /** The numbered page buttons, in order, as their labels. */
  const pageButtons = () =>
    Array.from(host.querySelectorAll('button[aria-label^="Page "]')).map(
      (b) => b.textContent?.trim() ?? ''
    );

  const input = (label: string) => host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;

  const setValue = (el: HTMLInputElement, value: string) => {
    el.value = value;
    el.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };

  const ids = () => datasource.records().map((row) => row.id);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniPaginatorComponent] }).compileComponents();
    datasource = new UniRecordDatasource<Row>([...ROWS]);
    fixture = TestBed.createComponent<UniPaginatorComponent<Row>>(UniPaginatorComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('datasource', datasource);
    fixture.componentRef.setInput('initPageSize', 10);
    fixture.detectChanges();
  });

  it('renders nothing without a datasource', () => {
    fixture.componentRef.setInput('datasource', undefined);
    fixture.detectChanges();

    expect(host.querySelectorAll('button')).toHaveLength(0);
  });

  it('applies initPageSize to the datasource, which is what pages the records', () => {
    expect(datasource.pageSize()).toBe(10);
    expect(datasource.pageCount()).toBe(3);
    expect(ids()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  describe('stepping through pages', () => {
    it('advances and retreats one page at a time', () => {
      click('Next Page');
      expect(datasource.pageIndex()).toBe(1);
      expect(ids()).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

      click('Previous Page');
      expect(datasource.pageIndex()).toBe(0);
      expect(ids()[0]).toBe(1);
    });

    it('jumps to the ends', () => {
      click('Last Page');
      expect(datasource.pageIndex()).toBe(2);
      // The last page is short: 25 rows over 3 pages of 10.
      expect(ids()).toEqual([21, 22, 23, 24, 25]);

      click('First Page');
      expect(datasource.pageIndex()).toBe(0);
    });

    it('disables the backward controls on the first page', () => {
      expect(buttonNamed('First Page').disabled).toBe(true);
      expect(buttonNamed('Previous Page').disabled).toBe(true);
      expect(buttonNamed('Next Page').disabled).toBe(false);
    });

    it('disables the forward controls on the last page', () => {
      click('Last Page');

      expect(buttonNamed('Next Page').disabled).toBe(true);
      expect(buttonNamed('Last Page').disabled).toBe(true);
      expect(buttonNamed('Previous Page').disabled).toBe(false);
    });

    it('cannot be walked off either end', () => {
      click('Previous Page');
      expect(datasource.pageIndex()).toBe(0);

      click('Last Page');
      click('Next Page');
      expect(datasource.pageIndex()).toBe(2);
    });
  });

  describe('page numbers', () => {
    it('marks the current page for assistive tech, not just visually', () => {
      const current = () =>
        host.querySelector('button[aria-current="page"]')?.textContent?.trim();

      expect(current()).toBe('1');

      click('Next Page');
      expect(current()).toBe('2');
      expect(host.querySelectorAll('button[aria-current="page"]')).toHaveLength(1);
    });

    it('jumps straight to a numbered page', () => {
      click('Page 3');

      expect(datasource.pageIndex()).toBe(2);
      expect(ids()).toEqual([21, 22, 23, 24, 25]);
    });

    it('truncates a long run of pages around the current one', () => {
      // 3 pages fit; 40 do not, and the datasource elides the middle.
      datasource.initialRecords.set(Array.from({ length: 400 }, (_, i) => ({ id: i + 1 })));
      fixture.detectChanges();

      // A window around page 1, an ellipsis, then the last page pinned so it
      // is always one click away.
      expect(pageButtons()).toEqual(['1', '2', '3', '4', '40']);
      expect(host.textContent).toContain('...');

      click('Page 4');
      // The window follows the current page rather than staying at the start.
      expect(pageButtons()).toContain('7');
    });

    it('hides the numbers when asked, keeping the steppers', () => {
      fixture.componentRef.setInput('showPageNumbers', false);
      fixture.detectChanges();

      expect(pageButtons()).toEqual([]);
      expect(host.querySelector('button[aria-label="Next Page"]')).toBeNull();
    });
  });

  describe('the page size and jump inputs', () => {
    it('repages the records when the size changes', () => {
      setValue(input('Items per page'), '5');

      expect(datasource.pageSize()).toBe(5);
      expect(datasource.pageCount()).toBe(5);
      expect(ids()).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns to the first page after a resize, so the view is never past the end', () => {
      click('Last Page');
      expect(datasource.pageIndex()).toBe(2);

      setValue(input('Items per page'), '5');
      expect(datasource.pageIndex()).toBe(0);
    });

    it('jumps to a typed page', () => {
      setValue(input('Jump to page'), '3');

      expect(datasource.pageIndex()).toBe(2);
      expect(ids()).toEqual([21, 22, 23, 24, 25]);
    });

    it('ignores a page outside the range rather than emptying the table', () => {
      setValue(input('Jump to page'), '99');
      expect(datasource.pageIndex()).toBe(0);

      setValue(input('Jump to page'), '0');
      expect(datasource.pageIndex()).toBe(0);
    });

    it('tracks the current page, so the jump box never disagrees with the buttons', () => {
      click('Next Page');
      expect(input('Jump to page').value).toBe('2');
    });

    it('hides each control on request', () => {
      fixture.componentRef.setInput('showPageSize', false);
      fixture.componentRef.setInput('showPageJumper', false);
      fixture.detectChanges();

      expect(host.querySelector('input[aria-label="Items per page"]')).toBeNull();
      expect(host.querySelector('input[aria-label="Jump to page"]')).toBeNull();
    });
  });
});
