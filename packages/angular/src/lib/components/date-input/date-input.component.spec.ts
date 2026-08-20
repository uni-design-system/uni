/**
 * Behaviours ported from the vanilla prototype's Playwright suite
 * (`packages/angular/prototypes/date-input/test.mjs`).
 *
 * Locale is pinned to en-US so parsing does not depend on the runtime's ICU.
 * The popup rides the native popover machinery, stubbed in test-setup.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDateInputComponent } from './date-input.component';
import type { UniDateInputRejection } from './date-input.model';

describe('UniDateInputComponent', () => {
  let fixture: ComponentFixture<UniDateInputComponent>;
  let host: HTMLElement;

  const flush = async () => {
    await Promise.resolve();
    fixture.detectChanges();
  };

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const field = () => host.querySelector<HTMLInputElement>('input[type="text"]')!;
  const toggle = () => host.querySelector<HTMLButtonElement>('button[icon-button]')!;
  const dialog = () => host.querySelector<HTMLElement>('[role="dialog"]');
  const day = (date: string) => host.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)!;
  const status = () =>
    Array.from(host.querySelectorAll('[role="status"]'))
      .map((el) => el.textContent?.trim())
      .join(' ')
      .trim();
  const value = () => fixture.componentInstance.value();

  const type = (text: string) => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const press = (key: string, init: KeyboardEventInit = {}, target: EventTarget = field()) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniDateInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniDateInputComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('label', 'Due date');
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('weekStart', 0);
    // The dropdown renders once the toggle's view-query resolves, so give the
    // gate a couple of change-detection passes before any test runs.
    fixture.detectChanges();
    await flush();
    await flush();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('typed entry', () => {
    it('commits ISO text on Enter and reformats to the display format', () => {
      type('2026-12-01');
      press('Enter');

      expect(value()).toBe('2026-12-01');
      expect(field().value).toBe('Dec 1, 2026');
    });

    it('commits locale-numeric and month-name text', () => {
      type('8/20/2026');
      press('Enter');
      expect(value()).toBe('2026-08-20');

      type('mar 1 2027');
      press('Enter');
      expect(value()).toBe('2027-03-01');
    });

    it('resolves a missing year to the next occurrence', () => {
      type('12/31');
      press('Enter');

      const thisYear = new Date().getFullYear();
      expect(value()).toBe(`${thisYear}-12-31`); // Dec 31 is always still ahead
    });

    it('keeps unreadable text in the field, flagged and announced', () => {
      const rejections: UniDateInputRejection[] = [];
      fixture.componentInstance.rejected.subscribe((r) => rejections.push(r));

      type('aug 32');
      press('Enter');

      expect(value()).toBeUndefined();
      expect(field().value).toBe('aug 32');
      expect(field().getAttribute('aria-invalid')).toBe('true');
      expect(status()).toContain('aug 32');
      expect(rejections).toEqual([{ raw: 'aug 32', reason: 'unparseable' }]);
    });

    it('refuses out-of-range and disabled dates with their reasons', () => {
      const rejections: UniDateInputRejection[] = [];
      fixture.componentInstance.rejected.subscribe((r) => rejections.push(r));
      setInputs({ minDate: '2026-08-05', maxDate: '2026-08-25', disabledDates: ['2026-08-12'] });

      type('2026-08-30');
      press('Enter');
      type('2026-08-12');
      press('Enter');

      expect(rejections.map((r) => r.reason)).toEqual(['out-of-range', 'disabled']);
      expect(value()).toBeUndefined();
    });

    it('honours a custom parse input over the built-in parser', () => {
      setInputs({ parse: (raw: string) => (raw === 'launch' ? '2026-09-01' : null) });

      type('launch');
      press('Enter');
      expect(value()).toBe('2026-09-01');
    });

    it('clears on committing an empty field', () => {
      setInputs({ value: '2026-08-20' });
      type('');
      press('Enter');
      expect(value()).toBeUndefined();
    });

    it('typing clears the invalid flag; Escape reverts to the committed text', () => {
      setInputs({ value: '2026-08-20' });
      type('aug 32');
      press('Enter');
      expect(field().getAttribute('aria-invalid')).toBe('true');

      type('aug 3');
      expect(field().getAttribute('aria-invalid')).toBeNull();

      press('Escape');
      expect(field().value).toBe('Aug 20, 2026');
    });

    it('commits on blur when commitOnBlur, and marks the field touched', () => {
      type('2026-08-20');
      host
        .querySelector('div')!
        .dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
      fixture.detectChanges();

      expect(value()).toBe('2026-08-20');
      expect(fixture.componentInstance.touched()).toBe(true);
    });

    it('renders in the configured displayFormat', () => {
      setInputs({ displayFormat: { dateStyle: 'long' }, value: '2026-08-20' });
      expect(field().value).toBe('August 20, 2026');
    });
  });

  describe('stepping', () => {
    it('ArrowUp/ArrowDown on a committed value step ±1 day', () => {
      setInputs({ value: '2026-08-20' });

      press('ArrowUp');
      expect(value()).toBe('2026-08-21');

      press('ArrowDown');
      press('ArrowDown');
      expect(value()).toBe('2026-08-19');
    });

    it('stepping skips disabled days and refuses to cross a fence', () => {
      setInputs({
        value: '2026-08-14',
        minDate: '2026-08-14',
        disabledDates: ['2026-08-15', '2026-08-16'],
      });

      press('ArrowUp');
      expect(value()).toBe('2026-08-17'); // skipped the blocked weekend

      press('ArrowDown');
      press('ArrowDown');
      press('ArrowDown');
      expect(value()).toBe('2026-08-14'); // the fence stops it
    });
  });

  describe('popup', () => {
    it('wires the dialog toggle: aria-haspopup, aria-expanded, name from the value', async () => {
      await flush();
      expect(toggle().getAttribute('aria-haspopup')).toBe('dialog');
      expect(toggle().getAttribute('aria-expanded')).toBe('false');
      // The name is projected text (visually hidden) so lint's content rule holds.
      expect(toggle().textContent).toContain('Choose date');

      setInputs({ value: '2026-08-20' });
      expect(toggle().textContent).toContain('Change date, Thursday, August 20, 2026');
    });

    it('Alt+ArrowDown opens the popup and moves focus into the grid', async () => {
      setInputs({ value: '2026-08-20' });
      await flush();

      press('ArrowDown', { altKey: true });
      await flush();
      await flush();

      expect(fixture.componentInstance['popupOpen']()).toBe(true);
      expect(toggle().getAttribute('aria-expanded')).toBe('true');
      expect(dialog()).toBeTruthy();
      expect(document.activeElement).toBe(day('2026-08-20'));
      expect(fixture.componentInstance.opened).toBeTruthy();
    });

    it('plain ArrowDown opens the popup only when the field is empty', async () => {
      await flush();
      press('ArrowDown');
      await flush();
      expect(fixture.componentInstance['popupOpen']()).toBe(true);
    });

    it('Enter on a day commits, closes, and returns focus to the field', async () => {
      setInputs({ value: '2026-08-20' });
      await flush();
      press('ArrowDown', { altKey: true });
      await flush();

      day('2026-08-12').click();
      await flush();

      expect(value()).toBe('2026-08-12');
      expect(fixture.componentInstance['popupOpen']()).toBe(false);
      expect(field().value).toBe('Aug 12, 2026');
      expect(document.activeElement).toBe(field());
    });

    it('Escape in the popup closes without selecting and returns focus', async () => {
      setInputs({ value: '2026-08-20' });
      await flush();
      press('ArrowDown', { altKey: true });
      await flush();

      press('Escape', {}, dialog()!);
      await flush();

      expect(value()).toBe('2026-08-20');
      expect(fixture.componentInstance['popupOpen']()).toBe(false);
      expect(document.activeElement).toBe(field());
    });

    it('Tab inside the popup cycles without leaving it', async () => {
      setInputs({ value: '2026-08-20' });
      await flush();
      press('ArrowDown', { altKey: true });
      await flush();
      await flush();

      const before = document.activeElement;
      const event = press('Tab', {}, dialog()!);
      await flush();

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).not.toBe(before);
      expect(dialog()!.contains(document.activeElement)).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('names the field and defaults the placeholder to the locale pattern', () => {
      expect(field().getAttribute('aria-label')).toBe('Due date');
      expect(field().placeholder).toBe('MM/DD/YYYY');
    });

    it('is a plain input, not a combobox — there is no filtering relationship', () => {
      expect(field().getAttribute('role')).toBeNull();
    });

    it('gates aria-invalid on touched or dirty, per the form-control rule', () => {
      setInputs({ invalid: true });
      expect(field().getAttribute('aria-invalid')).toBeNull();

      setInputs({ touched: true });
      expect(field().getAttribute('aria-invalid')).toBe('true');
    });

    it('announces commits through the status region', () => {
      type('2026-08-20');
      press('Enter');
      expect(status()).toContain('Thursday, August 20, 2026.');
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
