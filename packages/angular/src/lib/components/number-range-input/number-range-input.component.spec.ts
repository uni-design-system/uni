/**
 * The rules that make this one field rather than two glued together: a
 * backwards commit swaps, the ends fence each other's steppers, and either end
 * alone is a valid value.
 *
 * Ported from the prototype's Playwright assertions in
 * `packages/angular/prototypes/number-input/test.mjs`.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniNumberRangeInputComponent } from './number-range-input.component';
import type { UniNumberRange } from '../../cdk';

describe('UniNumberRangeInputComponent', () => {
  let fixture: ComponentFixture<UniNumberRangeInputComponent>;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const fields = (): HTMLInputElement[] => Array.from(host().querySelectorAll('input'));
  const start = (): HTMLInputElement => fields()[0];
  const end = (): HTMLInputElement => fields()[1];
  const live = (): string => host().querySelector('[role="status"]')!.textContent!.trim();
  const range = (): UniNumberRange | null => fixture.componentInstance.value();

  const set = (name: string, value: unknown): void => {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  };

  const type = (field: HTMLInputElement, text: string): void => {
    field.dispatchEvent(new FocusEvent('focus'));
    field.value = text;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const press = (field: HTMLInputElement, key: string, init: KeyboardEventInit = {}): void => {
    field.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
    fixture.detectChanges();
  };

  const commit = (field: HTMLInputElement, text: string): void => {
    type(field, text);
    press(field, 'Enter');
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniNumberRangeInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniNumberRangeInputComponent);
    fixture.componentRef.setInput('label', 'Price range');
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.detectChanges();
  });

  describe('ARIA contract', () => {
    it('is a named group over two spinbuttons', () => {
      const group = host().querySelector('[role="group"]')!;
      expect(group.getAttribute('aria-label')).toBe('Price range');
      expect(fields()).toHaveLength(2);
      expect(fields().every((f) => f.getAttribute('role') === 'spinbutton')).toBe(true);
    });

    it('names each end after the group', () => {
      expect(start().getAttribute('aria-label')).toBe('Price range, Minimum');
      expect(end().getAttribute('aria-label')).toBe('Price range, Maximum');

      set('startLabel', 'From');
      set('endLabel', 'To');
      expect(start().getAttribute('aria-label')).toBe('Price range, From');
      expect(end().getAttribute('aria-label')).toBe('Price range, To');
    });

    it('reports the other end as the wall, not the outer bound', () => {
      set('min', 0);
      set('max', 1000);
      fixture.componentInstance.value.set({ start: 200, end: 700 });
      fixture.detectChanges();

      expect(start().getAttribute('aria-valuemin')).toBe('0');
      expect(start().getAttribute('aria-valuemax')).toBe('700');
      expect(end().getAttribute('aria-valuemin')).toBe('200');
      expect(end().getAttribute('aria-valuemax')).toBe('1000');
    });

    it('holds the wall off by minGap', () => {
      set('min', 0);
      set('max', 1000);
      set('minGap', 50);
      fixture.componentInstance.value.set({ start: 200, end: 700 });
      fixture.detectChanges();

      expect(start().getAttribute('aria-valuemax')).toBe('650');
      expect(end().getAttribute('aria-valuemin')).toBe('250');
    });

    it('falls back to the outer bounds while an end is open', () => {
      set('min', 0);
      set('max', 1000);
      fixture.componentInstance.value.set({ start: 200 });
      fixture.detectChanges();

      // No end yet, so the start may travel the whole range.
      expect(start().getAttribute('aria-valuemax')).toBe('1000');
    });

    it('carries the affixes into aria-valuetext', () => {
      set('currency', 'USD');
      fixture.componentInstance.value.set({ start: 50, end: 500 });
      fixture.detectChanges();

      expect(start().getAttribute('aria-valuetext')).toBe('$50.00');
      expect(end().getAttribute('aria-valuetext')).toBe('$500.00');
    });

    it('hides the divider from the reader', () => {
      const divider = host().querySelector('span[aria-hidden="true"]')!;
      expect(divider.textContent?.trim()).toBe('–');
    });

    it('renders an adornment on each end, hidden from the reader', () => {
      set('currency', 'USD');
      const hidden = Array.from(host().querySelectorAll('span[aria-hidden="true"]')).map((s) =>
        s.textContent?.trim()
      );
      // One $ per end, plus the divider between them.
      expect(hidden).toEqual(['$', '–', '$']);
    });

    it('renders a suffix on each end', () => {
      set('suffix', '°C');
      const hidden = Array.from(host().querySelectorAll('span[aria-hidden="true"]')).map((s) =>
        s.textContent?.trim()
      );
      expect(hidden).toEqual(['°C', '–', '°C']);
    });
  });

  describe('value shape', () => {
    it('treats either end alone as a valid value', () => {
      // "$50 and up" is a real filter.
      commit(start(), '50');
      expect(range()).toEqual({ start: 50 });

      fixture.componentInstance.value.set(null);
      fixture.detectChanges();
      commit(end(), '500');
      expect(range()).toEqual({ end: 500 });
    });

    it('goes null only when both ends are empty', () => {
      commit(start(), '50');
      commit(end(), '500');
      expect(range()).toEqual({ start: 50, end: 500 });

      commit(start(), '');
      expect(range()).toEqual({ end: 500 });

      commit(end(), '');
      expect(range()).toBeNull();
    });

    it('formats each end on commit and shows raw text on focus', () => {
      set('currency', 'USD');
      fixture.componentInstance.value.set({ start: 1234.5, end: 5000 });
      fixture.detectChanges();

      expect(start().value).toBe('1,234.50');

      start().dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(start().value).toBe('1234.5');
    });
  });

  describe('swapping', () => {
    it('swaps a backwards typed commit rather than destroying it', () => {
      const swaps: unknown[] = [];
      fixture.componentInstance.swapped.subscribe((r) => swaps.push(r));

      fixture.componentInstance.value.set({ start: 50, end: 500 });
      fixture.detectChanges();

      // The user meant 50–900, and pointed at it from the wrong end.
      commit(start(), '900');

      expect(range()).toEqual({ start: 500, end: 900 });
      expect(swaps).toEqual([{ start: 500, end: 900 }]);
      expect(live()).toContain('swapped');
    });

    it('swaps from either side', () => {
      fixture.componentInstance.value.set({ start: 200, end: 700 });
      fixture.detectChanges();

      commit(end(), '100');
      expect(range()).toEqual({ start: 100, end: 200 });
    });

    it('leaves an in-order commit alone', () => {
      fixture.componentInstance.value.set({ start: 200, end: 700 });
      fixture.detectChanges();

      commit(start(), '300');
      expect(range()).toEqual({ start: 300, end: 700 });
      expect(live()).not.toContain('swapped');
    });
  });

  describe('minGap', () => {
    beforeEach(() => {
      set('minGap', 50);
      fixture.componentInstance.value.set({ start: 200, end: 700 });
      fixture.detectChanges();
    });

    it('pushes the edited end back to keep the gap', () => {
      commit(start(), '690');
      // 690 would leave only 10; the edited end is held at end − gap.
      expect(range()).toEqual({ start: 650, end: 700 });
      expect(live()).toContain('Kept');
    });

    it('pushes the other way when the upper end is edited', () => {
      commit(end(), '210');
      expect(range()).toEqual({ start: 200, end: 250 });
    });

    it('fences stepping instead of dragging the other end along', () => {
      // The wall is end − gap = 650, so stepping is free up to it.
      fixture.componentInstance.value.set({ start: 649, end: 700 });
      fixture.detectChanges();

      press(start(), 'ArrowUp');
      expect(range()).toEqual({ start: 650, end: 700 });

      // Past the wall it is a no-op, and the other end never moves — a fence,
      // not a push.
      press(start(), 'ArrowUp');
      press(start(), 'ArrowUp');
      expect(range()).toEqual({ start: 650, end: 700 });
      expect(live()).toContain('Maximum');
    });
  });

  describe('stepping', () => {
    beforeEach(() => {
      set('min', 0);
      set('max', 1000);
      fixture.componentInstance.value.set({ start: 200, end: 700 });
      fixture.detectChanges();
    });

    it('steps each end independently', () => {
      press(start(), 'ArrowUp');
      expect(range()).toEqual({ start: 201, end: 700 });

      press(end(), 'ArrowDown');
      expect(range()).toEqual({ start: 201, end: 699 });
    });

    it('cannot walk one end through the other', () => {
      fixture.componentInstance.value.set({ start: 699, end: 700 });
      fixture.detectChanges();

      press(start(), 'ArrowUp'); // reaches 700, the wall
      press(start(), 'ArrowUp'); // no-op
      const value = range() as UniNumberRange;
      expect(value.start).toBeLessThanOrEqual(value.end!);
      expect(value.end).toBe(700);
    });

    it('uses a large step for Shift+Arrow and PageUp/PageDown', () => {
      press(start(), 'ArrowUp', { shiftKey: true });
      expect((range() as UniNumberRange).start).toBe(210);

      press(start(), 'PageDown');
      expect((range() as UniNumberRange).start).toBe(200);
    });

    it('jumps to its own wall on Home and End', () => {
      press(start(), 'End');
      // The start's ceiling is the other end, not the outer max.
      expect((range() as UniNumberRange).start).toBe(700);

      fixture.componentInstance.value.set({ start: 200, end: 700 });
      fixture.detectChanges();
      press(end(), 'Home');
      expect((range() as UniNumberRange).end).toBe(200);
    });

    it('steps decimals exactly', () => {
      set('step', 0.1);
      fixture.componentInstance.value.set({ start: 0.2, end: 5 });
      fixture.detectChanges();

      press(start(), 'ArrowUp');
      expect((range() as UniNumberRange).start).toBe(0.3);
    });

    it('does nothing while disabled', () => {
      set('disabled', true);
      press(start(), 'ArrowUp');
      expect(range()).toEqual({ start: 200, end: 700 });
    });
  });

  describe('typed entry', () => {
    it('takes the same locale-grouped input the field does', () => {
      commit(start(), '1,200');
      expect(range()).toEqual({ start: 1200 });
    });

    it('clamps to the outer bounds, announced', () => {
      set('max', 1000);
      commit(end(), '9999');
      expect(range()).toEqual({ end: 1000 });
    });

    it('keeps unreadable text in place, flagged, and reports which end', () => {
      const rejections: unknown[] = [];
      fixture.componentInstance.rejected.subscribe((r) => rejections.push(r));

      commit(start(), '12..5');

      expect(start().value).toBe('12..5');
      expect(range()).toBeNull();
      expect(start().getAttribute('aria-invalid')).toBe('true');
      expect(end().getAttribute('aria-invalid')).toBeNull();
      expect(rejections).toEqual([{ part: 'start', raw: '12..5', reason: 'unparseable' }]);
    });

    it('clears the flag as soon as that end is edited', () => {
      commit(start(), 'abc');
      expect(start().getAttribute('aria-invalid')).toBe('true');

      type(start(), 'ab');
      expect(start().getAttribute('aria-invalid')).toBeNull();
    });

    it('reverts a draft on Escape', () => {
      fixture.componentInstance.value.set({ start: 200, end: 700 });
      fixture.detectChanges();

      type(start(), '999');
      press(start(), 'Escape');
      expect(range()).toEqual({ start: 200, end: 700 });
      expect(start().value).toBe('200');
    });

    it('commits on blur', () => {
      type(end(), '400');
      end().dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      expect(range()).toEqual({ end: 400 });
      expect(fixture.componentInstance.touched()).toBe(true);
    });
  });

  describe('chrome', () => {
    it('puts the leading inset on the row, not the inputs', () => {
      // uni-input-box styles `& input` at a higher specificity than a component
      // class can reach, so an inset set on the input is silently overridden.
      const insetOf = (el: Element): number =>
        parseFloat(getComputedStyle(el).paddingLeft) || 0;
      // The row is the nearest div; each part's affix wrapper is a span.
      const row = start().closest('div')!;

      expect(insetOf(row)).toBe(8);
      expect(insetOf(start())).toBe(0);
      expect(insetOf(end())).toBe(0);
    });
  });
});
