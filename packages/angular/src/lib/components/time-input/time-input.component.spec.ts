/**
 * Behaviours ported from the vanilla prototype's Playwright suite
 * (`packages/angular/prototypes/date-input/test.mjs`).
 *
 * Locale is pinned to en-US and hour12 set explicitly, so display strings
 * and the PM bias do not depend on the runtime's ICU.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniTimeInputComponent } from './time-input.component';
import type { UniTimeInputRejection } from './time-input.model';

describe('UniTimeInputComponent', () => {
  let fixture: ComponentFixture<UniTimeInputComponent>;
  let host: HTMLElement;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const field = () => host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  const options = () => Array.from(host.querySelectorAll<HTMLElement>('[role="option"]'));
  const status = () => host.querySelector('[role="status"]')?.textContent?.trim();
  const value = () => fixture.componentInstance.value();

  const type = (text: string) => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const press = (key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    field().dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniTimeInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniTimeInputComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('label', 'Start time');
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('hour12', true);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('typed entry', () => {
    it.each([
      ['930', '09:30', '9:30 AM'],
      ['9:30', '09:30', '9:30 AM'],
      ['9.30', '09:30', '9:30 AM'],
      ['3p', '15:00', '3:00 PM'],
      ['3 PM', '15:00', '3:00 PM'],
      ['15:00', '15:00', '3:00 PM'],
    ])('commits %s as %s and reformats', (raw, canonical, display) => {
      type(raw);
      press('Enter');

      expect(value()).toBe(canonical);
      expect(field().value).toBe(display);
    });

    it('leans PM for a bare small hour in a 12-hour field', () => {
      type('3');
      press('Enter');
      expect(value()).toBe('15:00');
    });

    it('the PM bias yields when it would push the time out of bounds', () => {
      setInputs({ minTime: '01:00', maxTime: '05:00' });
      type('3');
      press('Enter');
      expect(value()).toBe('03:00');
    });

    it('refuses out-of-range times, keeping the raw text', () => {
      const rejections: UniTimeInputRejection[] = [];
      fixture.componentInstance.rejected.subscribe((r) => rejections.push(r));
      setInputs({ minTime: '09:00', maxTime: '17:00' });

      type('18');
      press('Enter');

      expect(value()).toBeUndefined();
      expect(field().value).toBe('18');
      expect(field().getAttribute('aria-invalid')).toBe('true');
      expect(rejections).toEqual([{ raw: '18', reason: 'out-of-range' }]);
    });

    it('refuses unreadable text', () => {
      const rejections: UniTimeInputRejection[] = [];
      fixture.componentInstance.rejected.subscribe((r) => rejections.push(r));

      type('soon');
      press('Enter');

      expect(rejections).toEqual([{ raw: 'soon', reason: 'unparseable' }]);
      expect(status()).toContain('soon');
    });

    it('with slots set, a parseable but unlisted time is unavailable', () => {
      const rejections: UniTimeInputRejection[] = [];
      fixture.componentInstance.rejected.subscribe((r) => rejections.push(r));
      setInputs({ slots: ['09:00', '09:30', '11:00', '14:30'] });

      type('5pm');
      press('Enter');
      expect(rejections).toEqual([{ raw: '5pm', reason: 'unavailable' }]);
      expect(status()).toBe("5:00 PM isn't available.");
      expect(field().value).toBe('5pm');

      type('11');
      press('Enter');
      expect(value()).toBe('11:00');
    });

    it('clears on committing an empty field', () => {
      setInputs({ value: '09:00' });
      type('');
      press('Enter');
      expect(value()).toBeUndefined();
    });

    it('Escape backs out one layer at a time: close the list, then revert', () => {
      setInputs({ value: '15:00' });
      type('junk'); // typing opens the list

      press('Escape');
      expect(field().getAttribute('aria-expanded')).toBe('false');
      expect(field().value).toBe('junk');

      press('Escape');
      expect(field().value).toBe('3:00 PM');
    });

    it('Tab commits a dirty draft without trapping', () => {
      type('930');
      const event = press('Tab');

      expect(value()).toBe('09:30');
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('listbox', () => {
    beforeEach(() => setInputs({ minTime: '09:00', maxTime: '17:00', minuteStep: 30 }));

    it('generates options from minuteStep inside the fences', () => {
      press('ArrowDown');
      expect(options()).toHaveLength(17); // 09:00 … 17:00 every 30 min
      expect(options()[0].textContent?.trim()).toBe('9:00 AM');
      expect(options().at(-1)!.textContent?.trim()).toBe('5:00 PM');
    });

    it('ArrowDown opens the list and wires aria-activedescendant', () => {
      expect(field().getAttribute('aria-expanded')).toBe('false');

      press('ArrowDown');

      expect(field().getAttribute('aria-expanded')).toBe('true');
      expect(field().getAttribute('aria-controls')).toBeTruthy();
      expect(field().getAttribute('aria-activedescendant')).toBe(options()[0].id);
    });

    it('Enter picks the active option', () => {
      press('ArrowDown');
      press('ArrowDown');
      press('Enter');

      expect(value()).toBe('09:30');
      expect(field().value).toBe('9:30 AM');
      expect(options()).toHaveLength(0); // list closed
    });

    it('typing opens the list without selecting anything', () => {
      type('10');
      expect(field().getAttribute('aria-expanded')).toBe('true');
      expect(field().getAttribute('aria-activedescendant')).toBeFalsy();
    });

    it('marks the committed option aria-selected', () => {
      setInputs({ value: '09:30' });
      type('9');
      const selected = options().filter((o) => o.getAttribute('aria-selected') === 'true');
      expect(selected).toHaveLength(1);
      expect(selected[0].textContent?.trim()).toBe('9:30 AM');
    });

    it('clicking an option commits it', () => {
      press('ArrowDown');
      options()[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(value()).toBe('10:00');
    });

    it('Escape closes the list first', () => {
      press('ArrowDown');
      expect(options().length).toBeGreaterThan(0);

      press('Escape');
      expect(options()).toHaveLength(0);
    });
  });

  describe('stepping on a committed value with the list closed', () => {
    it('steps ±minuteStep, snapped and clamped', () => {
      setInputs({ value: '09:30', minTime: '09:00', maxTime: '17:00', minuteStep: 30 });

      press('ArrowUp');
      expect(value()).toBe('10:00');

      press('ArrowDown');
      press('ArrowDown');
      expect(value()).toBe('09:00');

      press('ArrowDown'); // at the fence — stays
      expect(value()).toBe('09:00');
    });

    it('moves to the adjacent slot when slots are pinned', () => {
      setInputs({ value: '09:30', slots: ['09:00', '09:30', '11:00', '14:30'] });

      press('ArrowUp');
      expect(value()).toBe('11:00');

      press('ArrowDown');
      press('ArrowDown');
      expect(value()).toBe('09:00');
    });

    it('arrows open the list instead when the draft is edited', () => {
      setInputs({ value: '09:30', minTime: '09:00', maxTime: '17:00' });
      type('10');

      press('ArrowDown');
      expect(value()).toBe('09:30'); // unchanged — the list opened
      expect(field().getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('accessibility', () => {
    it('is a combobox over a listbox, byte-for-byte the search-input contract', () => {
      expect(field().getAttribute('role')).toBe('combobox');
      expect(field().getAttribute('aria-autocomplete')).toBe('list');

      const toggle = host.querySelector<HTMLButtonElement>('button[icon-button]')!;
      expect(toggle.getAttribute('aria-haspopup')).toBe('listbox');
      expect(toggle.textContent).toContain('Choose time');
    });

    it('announces commits through the status region', () => {
      type('930');
      press('Enter');
      expect(status()).toBe('9:30 AM.');
    });

    it('gates aria-invalid on touched or dirty, per the form-control rule', () => {
      setInputs({ invalid: true });
      expect(field().getAttribute('aria-invalid')).toBeNull();

      setInputs({ touched: true });
      expect(field().getAttribute('aria-invalid')).toBe('true');
    });

    it('commits on blur and marks the field touched', () => {
      type('930');
      host
        .querySelector('div')!
        .dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
      fixture.detectChanges();

      expect(value()).toBe('09:30');
      expect(fixture.componentInstance.touched()).toBe(true);
    });
  });

  describe('embedded mode', () => {
    it('drops the input-box chrome for composers', () => {
      expect(host.querySelector('uni-input-box')).toBeTruthy();

      setInputs({ embedded: true });
      expect(host.querySelector('uni-input-box')).toBeNull();
      expect(field()).toBeTruthy();
    });
  });
});
