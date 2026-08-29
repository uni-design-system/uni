/**
 * The keyboard map, the ARIA contract and the two-event drag protocol. Ported
 * from the prototype's Playwright assertions in
 * `packages/angular/prototypes/number-input/test.mjs`.
 *
 * jsdom has no layout, so `getBoundingClientRect` is stubbed where a pointer
 * position has to mean something.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniSliderComponent } from './slider.component';
import type { UniNumberRange } from '../../cdk';

describe('UniSliderComponent', () => {
  let fixture: ComponentFixture<UniSliderComponent>;

  const thumbs = (): HTMLElement[] =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[role="slider"]'));
  const thumb = (index = 0): HTMLElement => thumbs()[index];
  const track = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('[role="slider"]')!
      .parentElement as HTMLElement;
  const live = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')!;

  const press = (element: HTMLElement, key: string, init: KeyboardEventInit = {}): void => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, ...init }));
    fixture.detectChanges();
  };

  /** Give the track a 200px box so pointer x maps to a value. */
  const layOutTrack = (): void => {
    track().getBoundingClientRect = () =>
      ({ left: 0, width: 200, top: 0, height: 4, right: 200, bottom: 4 }) as DOMRect;
  };

  const pointer = (type: string, clientX: number, target?: HTMLElement): void => {
    const event = new Event(type, { bubbles: true }) as PointerEvent;
    Object.defineProperty(event, 'clientX', { value: clientX });
    Object.defineProperty(event, 'pointerId', { value: 1 });
    (target ?? track()).dispatchEvent(event);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniSliderComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniSliderComponent);
    fixture.componentRef.setInput('label', 'Opacity');
    fixture.detectChanges();
  });

  describe('ARIA contract', () => {
    it('carries the full slider role set', () => {
      fixture.componentInstance.value.set(64);
      fixture.detectChanges();

      expect(thumb().getAttribute('role')).toBe('slider');
      expect(thumb().tabIndex).toBe(0);
      expect(thumb().getAttribute('aria-label')).toBe('Opacity');
      expect(thumb().getAttribute('aria-valuenow')).toBe('64');
      expect(thumb().getAttribute('aria-valuemin')).toBe('0');
      expect(thumb().getAttribute('aria-valuemax')).toBe('100');
      expect(thumb().getAttribute('aria-valuetext')).toBe('64');
    });

    it('is one tab stop in single mode and two in range mode', () => {
      expect(thumbs()).toHaveLength(1);

      fixture.componentRef.setInput('mode', 'range');
      fixture.detectChanges();
      expect(thumbs()).toHaveLength(2);
    });

    it('groups and names both thumbs in range mode', () => {
      fixture.componentRef.setInput('mode', 'range');
      fixture.componentInstance.value.set({ start: 20, end: 80 });
      fixture.detectChanges();

      const group = (fixture.nativeElement as HTMLElement).querySelector('[role="group"]')!;
      expect(group.getAttribute('aria-label')).toBe('Opacity');
      expect(thumb(0).getAttribute('aria-label')).toBe('Opacity, minimum');
      expect(thumb(1).getAttribute('aria-label')).toBe('Opacity, maximum');
    });

    it('makes each range thumb report the other as its wall', () => {
      fixture.componentRef.setInput('mode', 'range');
      fixture.componentInstance.value.set({ start: 20, end: 80 });
      fixture.detectChanges();

      // The lower thumb may travel from min up to the higher thumb.
      expect(thumb(0).getAttribute('aria-valuemin')).toBe('0');
      expect(thumb(0).getAttribute('aria-valuemax')).toBe('80');
      expect(thumb(1).getAttribute('aria-valuemin')).toBe('20');
      expect(thumb(1).getAttribute('aria-valuemax')).toBe('100');
    });

    it('speaks a mark label instead of the number', () => {
      fixture.componentRef.setInput('marks', [
        { value: 0, label: 'Small' },
        { value: 50, label: 'Medium' },
        { value: 100, label: 'Large' },
      ]);
      fixture.componentInstance.value.set(50);
      fixture.detectChanges();

      expect(thumb().getAttribute('aria-valuetext')).toBe('Medium');
    });

    it('gates aria-invalid on touched or dirty', () => {
      fixture.componentRef.setInput('invalid', true);
      fixture.detectChanges();
      expect(thumb().getAttribute('aria-invalid')).toBeNull();

      thumb().dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      expect(thumb().getAttribute('aria-invalid')).toBe('true');
    });

    it('folds a custom format into aria-valuetext', () => {
      fixture.componentRef.setInput('formatValue', (v: number) => `$${v}`);
      fixture.componentInstance.value.set(500);
      fixture.detectChanges();

      expect(thumb().getAttribute('aria-valuetext')).toBe('$500');
    });
  });

  describe('keyboard', () => {
    beforeEach(() => {
      fixture.componentInstance.value.set(50);
      fixture.detectChanges();
    });

    it('steps by step on the arrows', () => {
      press(thumb(), 'ArrowRight');
      expect(fixture.componentInstance.value()).toBe(51);

      press(thumb(), 'ArrowLeft');
      expect(fixture.componentInstance.value()).toBe(50);

      press(thumb(), 'ArrowUp');
      expect(fixture.componentInstance.value()).toBe(51);

      press(thumb(), 'ArrowDown');
      expect(fixture.componentInstance.value()).toBe(50);
    });

    it('uses the large step for Shift+Arrow and PageUp/PageDown', () => {
      // Default large step is a tenth of the range.
      press(thumb(), 'ArrowUp', { shiftKey: true });
      expect(fixture.componentInstance.value()).toBe(60);

      press(thumb(), 'PageDown');
      expect(fixture.componentInstance.value()).toBe(50);

      fixture.componentRef.setInput('largeStep', 25);
      fixture.detectChanges();
      press(thumb(), 'PageUp');
      expect(fixture.componentInstance.value()).toBe(75);
    });

    it('jumps to the fences on Home and End', () => {
      press(thumb(), 'Home');
      expect(fixture.componentInstance.value()).toBe(0);

      press(thumb(), 'End');
      expect(fixture.componentInstance.value()).toBe(100);
    });

    it('stops at a fence rather than passing it', () => {
      press(thumb(), 'End');
      press(thumb(), 'ArrowUp');
      expect(fixture.componentInstance.value()).toBe(100);

      press(thumb(), 'Home');
      press(thumb(), 'ArrowDown');
      expect(fixture.componentInstance.value()).toBe(0);
    });

    it('steps decimals exactly', () => {
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('max', 1);
      fixture.componentRef.setInput('step', 0.1);
      fixture.componentInstance.value.set(0.2);
      fixture.detectChanges();

      press(thumb(), 'ArrowUp');
      // 0.2 + 0.1 is 0.30000000000000004 in float arithmetic.
      expect(fixture.componentInstance.value()).toBe(0.3);
    });

    it('walks between marks when they are the only stops', () => {
      fixture.componentRef.setInput('marks', [{ value: 0 }, { value: 25 }, { value: 90 }]);
      fixture.componentRef.setInput('snapToMarks', true);
      fixture.componentInstance.value.set(25);
      fixture.detectChanges();

      press(thumb(), 'ArrowUp');
      expect(fixture.componentInstance.value()).toBe(90);

      press(thumb(), 'ArrowDown');
      expect(fixture.componentInstance.value()).toBe(25);
    });

    it('ignores keys it does not own', () => {
      press(thumb(), 'Enter');
      press(thumb(), 'a');
      expect(fixture.componentInstance.value()).toBe(50);
    });

    it('does nothing while disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      press(thumb(), 'ArrowUp');
      expect(fixture.componentInstance.value()).toBe(50);
    });

    it('announces the committed value once per key run', () => {
      press(thumb(), 'ArrowUp');
      expect(live().textContent?.trim()).toBe('51.');
    });
  });

  describe('events', () => {
    it('emits sliding during movement and changed once on key-up', () => {
      const sliding: unknown[] = [];
      const changed: unknown[] = [];
      fixture.componentInstance.sliding.subscribe((v) => sliding.push(v));
      fixture.componentInstance.changed.subscribe((v) => changed.push(v));

      fixture.componentInstance.value.set(50);
      fixture.detectChanges();
      press(thumb(), 'ArrowUp');

      expect(sliding).toEqual([51]);
      expect(changed).toEqual([51]);
    });

    it('streams sliding across a drag but commits once on release', () => {
      const sliding: unknown[] = [];
      const changed: unknown[] = [];
      fixture.componentInstance.sliding.subscribe((v) => sliding.push(v));
      fixture.componentInstance.changed.subscribe((v) => changed.push(v));

      fixture.componentInstance.value.set(0);
      fixture.detectChanges();
      layOutTrack();

      pointer('pointerdown', 20);
      pointer('pointermove', 60);
      pointer('pointermove', 100);
      pointer('pointerup', 100);

      expect(sliding).toEqual([10, 30, 50]);
      expect(changed).toEqual([50]);
      // The model is written only on release — a 60 Hz stream into a form is
      // how sliders get blamed for jank.
      expect(fixture.componentInstance.value()).toBe(50);
    });
  });

  describe('pointer', () => {
    beforeEach(() => {
      fixture.componentInstance.value.set(0);
      fixture.detectChanges();
      layOutTrack();
    });

    it('jumps to a press anywhere on the track', () => {
      pointer('pointerdown', 150);
      pointer('pointerup', 150);
      expect(fixture.componentInstance.value()).toBe(75);
    });

    it('snaps a press to the step grid', () => {
      fixture.componentRef.setInput('step', 25);
      fixture.detectChanges();

      pointer('pointerdown', 130); // 65% → nearest 25-grid stop is 75
      pointer('pointerup', 130);
      expect(fixture.componentInstance.value()).toBe(75);
    });

    it('snaps a press to the nearest mark when marks are the only stops', () => {
      fixture.componentRef.setInput('marks', [{ value: 0 }, { value: 30 }, { value: 90 }]);
      fixture.componentRef.setInput('snapToMarks', true);
      fixture.detectChanges();

      pointer('pointerdown', 80); // 40% → nearest mark is 30
      pointer('pointerup', 80);
      expect(fixture.componentInstance.value()).toBe(30);
    });

    it('moves the nearer thumb in range mode', () => {
      fixture.componentRef.setInput('mode', 'range');
      fixture.componentInstance.value.set({ start: 20, end: 80 });
      fixture.detectChanges();
      layOutTrack();

      pointer('pointerdown', 60); // 30% — nearer the start thumb
      pointer('pointerup', 60);
      expect(fixture.componentInstance.value()).toEqual({ start: 30, end: 80 });
    });

    it('lets range thumbs cross and swap roles', () => {
      fixture.componentRef.setInput('mode', 'range');
      fixture.componentInstance.value.set({ start: 20, end: 80 });
      fixture.detectChanges();
      layOutTrack();

      // Grab the start thumb and drag it past the end thumb.
      pointer('pointerdown', 40, thumb(0));
      pointer('pointermove', 190);
      pointer('pointerup', 190);

      // The range comes out ordered, whichever thumb ended up where.
      expect(fixture.componentInstance.value()).toEqual({ start: 80, end: 95 });
      // The dragged thumb keeps its identity and is now the maximum.
      expect(thumb(0).getAttribute('aria-label')).toBe('Opacity, maximum');
    });

    it('does nothing while disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      pointer('pointerdown', 150);
      pointer('pointerup', 150);
      expect(fixture.componentInstance.value()).toBe(0);
    });
  });

  describe('range fences', () => {
    it('keeps minGap between the ends', () => {
      fixture.componentRef.setInput('mode', 'range');
      fixture.componentRef.setInput('minGap', 10);
      fixture.componentInstance.value.set({ start: 20, end: 40 });
      fixture.detectChanges();

      // Walk the lower thumb up; it should stop 10 short of the upper one.
      for (let i = 0; i < 30; i++) press(thumb(0), 'ArrowUp');

      expect((fixture.componentInstance.value() as UniNumberRange).start).toBe(30);
      expect((fixture.componentInstance.value() as UniNumberRange).end).toBe(40);
    });

    it('treats either end alone as a valid value', () => {
      fixture.componentRef.setInput('mode', 'range');
      fixture.componentInstance.value.set({ start: 50 });
      fixture.detectChanges();

      // The absent end falls back to max rather than emptying the slider.
      expect(thumb(0).getAttribute('aria-valuenow')).toBe('50');
      expect(thumb(1).getAttribute('aria-valuenow')).toBe('100');
    });
  });

  describe('geometry', () => {
    it('positions the thumb and fill as percentages of the range', () => {
      fixture.componentRef.setInput('min', 50);
      fixture.componentRef.setInput('max', 150);
      fixture.componentInstance.value.set(75);
      fixture.detectChanges();

      expect(thumb().style.getPropertyValue('inset-inline-start')).toBe('25%');
    });

    it('anchors the fill at origin for a slider that spans zero', () => {
      fixture.componentRef.setInput('min', -100);
      fixture.componentRef.setInput('max', 100);
      fixture.componentRef.setInput('origin', 0);
      fixture.componentInstance.value.set(-50);
      fixture.detectChanges();

      const fill = (fixture.nativeElement as HTMLElement).querySelector(
        '[role="slider"]'
      )!.previousElementSibling as HTMLElement;
      // Fill runs from the value (25%) to the origin (50%).
      expect(fill.style.getPropertyValue('inset-inline-start')).toBe('25%');
      expect(fill.style.getPropertyValue('inset-inline-end')).toBe('50%');
    });

    it('renders a mark label row only when a mark carries a label', () => {
      fixture.componentRef.setInput('marks', [{ value: 50 }]);
      fixture.detectChanges();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('[role="presentation"]')
      ).toBeNull();

      fixture.componentRef.setInput('marks', [{ value: 50, label: 'Half' }]);
      fixture.detectChanges();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('[role="presentation"]')
      ).not.toBeNull();
    });
  });
});
