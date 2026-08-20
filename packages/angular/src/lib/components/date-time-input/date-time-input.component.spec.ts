/**
 * Behaviours ported from the vanilla prototype's Playwright suite
 * (`packages/angular/prototypes/date-input/test.mjs`) — the composed
 * scheduling flow: pick a day, get that day's slots, one combined value.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDateTimeInputComponent } from './date-time-input.component';

const SLOTS: Record<string, string[]> = {
  '2026-08-20': ['09:00', '13:30'],
  '2026-08-21': ['09:00', '11:00'],
};

describe('UniDateTimeInputComponent', () => {
  let fixture: ComponentFixture<UniDateTimeInputComponent>;
  let host: HTMLElement;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const dateField = () => host.querySelector<HTMLInputElement>('uni-date-input input')!;
  const timeField = () => host.querySelector<HTMLInputElement>('uni-time-input input')!;
  const value = () => fixture.componentInstance.value();

  const commitDate = (text: string) => {
    dateField().value = text;
    dateField().dispatchEvent(new Event('input'));
    dateField().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    );
    fixture.detectChanges();
  };

  const commitTime = (text: string) => {
    timeField().value = text;
    timeField().dispatchEvent(new Event('input'));
    timeField().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    );
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniDateTimeInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniDateTimeInputComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('label', 'Appointment');
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('hour12', true);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  });

  it('creates one group under one label with Date and Time parts', () => {
    const group = host.querySelector('[role="group"]')!;
    expect(group.getAttribute('aria-label')).toBe('Appointment');
    expect(dateField().getAttribute('aria-label')).toBe('Date');
    expect(timeField().getAttribute('aria-label')).toBe('Time');
  });

  it('renders one shared input-box, not one per part', () => {
    expect(host.querySelectorAll('uni-input-box')).toHaveLength(1);
  });

  it('emits the combined value only when both parts are set', () => {
    commitDate('2026-08-20');
    expect(value()).toBeUndefined();

    commitTime('930');
    expect(value()).toBe('2026-08-20T09:30');
  });

  it('clearing the date clears the combined value and the time part', () => {
    commitDate('2026-08-20');
    commitTime('930');
    expect(value()).toBe('2026-08-20T09:30');

    commitDate('');
    expect(value()).toBeUndefined();
    expect(timeField().value).toBe('');
  });

  it('an external value write populates both parts', () => {
    setInputs({ value: '2026-08-20T15:00' });

    expect(dateField().value).toBe('Aug 20, 2026');
    expect(timeField().value).toBe('3:00 PM');
  });

  it('a partial state survives its own undefined round-trip', () => {
    commitDate('2026-08-20');
    expect(value()).toBeUndefined();
    expect(dateField().value).toBe('Aug 20, 2026'); // the echo must not wipe it
  });

  describe('scheduling with slotsFor', () => {
    beforeEach(() => setInputs({ slotsFor: (d: string) => SLOTS[d] ?? [] }));

    it('disables the time part until a date is chosen', () => {
      expect(timeField().disabled).toBe(true);

      commitDate('2026-08-20');
      expect(timeField().disabled).toBe(false);
    });

    it('offers exactly the chosen day’s slots', () => {
      commitDate('2026-08-20');
      timeField().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
      );
      fixture.detectChanges();

      const options = Array.from(host.querySelectorAll('[role="option"]'));
      expect(options.map((o) => o.textContent?.trim())).toEqual(['9:00 AM', '1:30 PM']);
    });

    it('changing the day clears a slot that no longer exists', () => {
      commitDate('2026-08-20');
      commitTime('1:30 PM');
      expect(value()).toBe('2026-08-20T13:30');

      commitDate('2026-08-21'); // 13:30 is not offered on the 21st
      expect(value()).toBeUndefined();
      expect(timeField().value).toBe('');
    });

    it('keeps a slot both days offer', () => {
      commitDate('2026-08-20');
      commitTime('9');
      expect(value()).toBe('2026-08-20T09:00');

      commitDate('2026-08-21');
      expect(value()).toBe('2026-08-21T09:00');
    });
  });

  describe('min/max fences split into date and time fences', () => {
    beforeEach(() => setInputs({ minDateTime: '2026-08-10T09:00', maxDateTime: '2026-08-30T17:00' }));

    it('applies the date fences to the date part', () => {
      commitDate('2026-08-05');
      expect(value()).toBeUndefined();
      expect(dateField().getAttribute('aria-invalid')).toBe('true');
    });

    it('applies the time fence only on the boundary date', () => {
      commitDate('2026-08-10'); // the min date
      commitTime('8'); // 08:00 < 09:00
      expect(value()).toBeUndefined();

      commitTime('930');
      expect(value()).toBe('2026-08-10T09:30');

      commitDate('2026-08-15'); // mid-range: no time fence
      commitTime('8');
      expect(value()).toBe('2026-08-15T08:00');
    });
  });

  it('disables both parts when the control is disabled', () => {
    setInputs({ disabled: true });
    expect(dateField().disabled).toBe(true);
    expect(timeField().disabled).toBe(true);
  });

  it('marks the control touched when focus leaves it', () => {
    expect(fixture.componentInstance.touched()).toBe(false);
    host.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    fixture.detectChanges();
    expect(fixture.componentInstance.touched()).toBe(true);
  });
});
