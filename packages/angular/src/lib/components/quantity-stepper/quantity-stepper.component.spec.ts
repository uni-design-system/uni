/**
 * The cart-line behaviours from the prototype's Playwright suite: typing beats
 * tapping, the remove affordance at the floor, and the read-only middle.
 *
 * The arithmetic and parsing are the cdk's and tested there; what is checked
 * here is this control's own policy and its ARIA.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniQuantityStepperComponent } from './quantity-stepper.component';

describe('UniQuantityStepperComponent', () => {
  let fixture: ComponentFixture<UniQuantityStepperComponent>;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const field = (): HTMLInputElement | null => host().querySelector('input');
  const buttons = (): HTMLButtonElement[] => Array.from(host().querySelectorAll('button'));
  const decrease = (): HTMLButtonElement => buttons()[0];
  const increase = (): HTMLButtonElement => buttons()[1];
  const live = (): string => host().querySelector('[role="status"]')!.textContent!.trim();

  const set = (name: string, value: unknown): void => {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  };

  /** A press-and-release, which is what a click on a stepper button is. */
  const tap = (button: HTMLButtonElement): void => {
    button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    button.dispatchEvent(new Event('pointerup', { bubbles: true }));
    button.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
  };

  const type = (text: string): void => {
    field()!.value = text;
    field()!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const press = (key: string): void => {
    field()!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniQuantityStepperComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniQuantityStepperComponent);
    fixture.componentRef.setInput('label', 'Quantity, Blue T-shirt (M)');
    fixture.detectChanges();
  });

  describe('ARIA contract', () => {
    it('makes the middle a spinbutton named by the label', () => {
      fixture.componentInstance.value.set(3);
      fixture.detectChanges();

      expect(field()!.getAttribute('role')).toBe('spinbutton');
      expect(field()!.getAttribute('aria-label')).toBe('Quantity, Blue T-shirt (M)');
      expect(field()!.getAttribute('aria-valuenow')).toBe('3');
      expect(field()!.getAttribute('aria-valuemin')).toBe('0');
    });

    it('names both buttons after the thing being counted', () => {
      fixture.componentInstance.value.set(3);
      fixture.detectChanges();

      expect(decrease().getAttribute('aria-label')).toBe('Decrease Quantity, Blue T-shirt (M)');
      expect(increase().getAttribute('aria-label')).toBe('Increase Quantity, Blue T-shirt (M)');
    });

    it('is one tab stop while editable, and the buttons are the stops when not', () => {
      expect(decrease().getAttribute('tabindex')).toBe('-1');
      expect(increase().getAttribute('tabindex')).toBe('-1');

      set('editable', false);
      expect(decrease().getAttribute('tabindex')).toBeNull();
      expect(increase().getAttribute('tabindex')).toBeNull();
    });

    it('groups and names itself when there is no input to name', () => {
      expect(host().querySelector('[role="group"]')).toBeNull();

      set('editable', false);
      const group = host().querySelector('[role="group"]')!;
      expect(group.getAttribute('aria-label')).toBe('Quantity, Blue T-shirt (M)');
    });

    it('says Empty rather than nothing when it has no value', () => {
      expect(field()!.getAttribute('aria-valuetext')).toBe('Empty');
      expect(field()!.getAttribute('aria-valuenow')).toBeNull();
    });
  });

  describe('stepping', () => {
    beforeEach(() => {
      fixture.componentInstance.value.set(3);
      fixture.detectChanges();
    });

    it('steps on the buttons', () => {
      tap(increase());
      expect(fixture.componentInstance.value()).toBe(4);

      tap(decrease());
      expect(fixture.componentInstance.value()).toBe(3);
    });

    it('steps on the arrow keys', () => {
      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(4);

      press('ArrowDown');
      expect(fixture.componentInstance.value()).toBe(3);
    });

    it('honours a fractional step exactly', () => {
      set('step', 0.5);
      fixture.componentInstance.value.set(0.2);
      fixture.detectChanges();

      press('ArrowUp');
      // Off-grid values snap toward travel on the min-anchored grid.
      expect(fixture.componentInstance.value()).toBe(0.5);
    });

    it('disables the button at the fence it cannot pass', () => {
      set('min', 1);
      set('max', 5);
      fixture.componentInstance.value.set(5);
      fixture.detectChanges();
      expect(increase().disabled).toBe(true);
      expect(decrease().disabled).toBe(false);

      fixture.componentInstance.value.set(1);
      fixture.detectChanges();
      expect(decrease().disabled).toBe(true);
    });

    it('announces the fence rather than doing nothing quietly', () => {
      set('max', 3);
      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(3);
      expect(live()).toBe('Maximum, 3.');
    });

    it('seeds an empty stepper at min', () => {
      fixture.componentInstance.value.set(null);
      set('min', 1);
      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(1);
    });

    it('does nothing while disabled', () => {
      set('disabled', true);
      tap(increase());
      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(3);
    });
  });

  describe('typed entry', () => {
    it('lets you type a quantity instead of tapping eleven times', () => {
      fixture.componentInstance.value.set(1);
      fixture.detectChanges();

      type('12');
      press('Enter');
      expect(fixture.componentInstance.value()).toBe(12);
    });

    it('takes the same grouped input the field does', () => {
      set('max', 5000);
      type('1,200');
      press('Enter');
      expect(fixture.componentInstance.value()).toBe(1200);
    });

    it('clamps a typed value to the fences and says so', () => {
      set('max', 10);
      type('99');
      press('Enter');

      expect(fixture.componentInstance.value()).toBe(10);
      expect(live()).toBe('Maximum is 10.');
    });

    it('reverts unreadable text, having nowhere to show an error', () => {
      fixture.componentInstance.value.set(3);
      fixture.detectChanges();

      type('abc');
      press('Enter');

      expect(fixture.componentInstance.value()).toBe(3);
      expect(field()!.value).toBe('3');
      expect(live()).toContain('not a number');
    });

    it('commits on blur and reverts on Escape', () => {
      fixture.componentInstance.value.set(3);
      fixture.detectChanges();

      type('7');
      field()!.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toBe(7);

      type('99');
      press('Escape');
      expect(fixture.componentInstance.value()).toBe(7);
      expect(field()!.value).toBe('7');
    });
  });

  describe('deleteAtMin', () => {
    beforeEach(() => {
      set('min', 1);
      set('deleteAtMin', true);
      fixture.componentInstance.value.set(1);
      fixture.detectChanges();
    });

    it('turns the decrement into a remove affordance at the floor', () => {
      expect(decrease().getAttribute('aria-label')).toBe('Remove Quantity, Blue T-shirt (M)');
      // It must stay enabled: at min it is the one control that still does
      // something.
      expect(decrease().disabled).toBe(false);
    });

    it('emits removed instead of stepping to zero', () => {
      const removals: unknown[] = [];
      fixture.componentInstance.removed.subscribe(() => removals.push(true));

      tap(decrease());

      expect(removals).toHaveLength(1);
      expect(fixture.componentInstance.value()).toBe(1);
      expect(live()).toContain('removed');
    });

    it('restores the ordinary decrement once above the floor', () => {
      tap(increase());
      expect(fixture.componentInstance.value()).toBe(2);
      expect(decrease().getAttribute('aria-label')).toBe('Decrease Quantity, Blue T-shirt (M)');

      tap(decrease());
      expect(fixture.componentInstance.value()).toBe(1);
    });

    it('stays an ordinary disabled decrement without the flag', () => {
      set('deleteAtMin', false);
      expect(decrease().getAttribute('aria-label')).toBe('Decrease Quantity, Blue T-shirt (M)');
      expect(decrease().disabled).toBe(true);
    });
  });

  describe('editable=false', () => {
    beforeEach(() => {
      fixture.componentInstance.value.set(4);
      set('editable', false);
    });

    it('renders the value as text with no caret', () => {
      expect(field()).toBeNull();
      expect(host().textContent).toContain('4');
    });

    it('still steps from the buttons', () => {
      tap(increase());
      expect(fixture.componentInstance.value()).toBe(5);
    });
  });

  describe('focus', () => {
    it('shows the shared field focus indicator on the container', () => {
      // The middle input clears its own outline, so without a container rule
      // the control would have no focus state at all.
      const root = host().querySelector('div')!;
      const sheets = Array.from(document.querySelectorAll('style'))
        .map((s) => s.textContent ?? '')
        .filter((text) => Array.from(root.classList).some((c) => text.includes(`.${c}`)))
        .join('');

      expect(sheets).toContain(':has(input:focus)');
      // The same tokens uni-input-box uses for every other field.
      expect(sheets).toContain('outline-offset:2px');
    });

    it('puts focus in the field when a stepper is pressed', () => {
      // Otherwise the arrow keys go dead the moment you click +, which is
      // exactly when someone reaches for them.
      field()!.blur();
      increase().dispatchEvent(new Event('pointerdown', { bubbles: true }));
      fixture.detectChanges();

      expect(document.activeElement).toBe(field());
    });

    it('falls back to the button when there is no field to focus', () => {
      set('editable', false);
      expect(field()).toBeNull();

      increase().dispatchEvent(new Event('pointerdown', { bubbles: true }));
      fixture.detectChanges();

      // Read-only mode makes the buttons the tab stops, so focus belongs there.
      expect(document.activeElement).toBe(increase());
    });

    it('takes its container chrome from the shared input entry', () => {
      // A theme that restyles its fields must carry the stepper beside them —
      // the stepper is not a field, but it sits next to one in a cart row.
      const root = host().querySelector('div')!;
      const styles = getComputedStyle(root);

      // `color`/`border`/`borderRadius` are unset in the base theme, so these
      // resolve only if the fallback to `input` is working. jsdom does not
      // expand the border-radius shorthand, so read it rather than a corner.
      expect(styles.backgroundColor).not.toBe('');
      expect(styles.borderTopWidth).toBe('1px');
      expect(parseFloat(styles.borderRadius)).toBeGreaterThan(0);
    });

    it('draws the dividers in the same weight as the outer border', () => {
      // A heavier rule down the middle makes the control read as three parts
      // stuck together rather than one frame.
      fixture.componentInstance.value.set(3);
      fixture.detectChanges();

      const root = host().querySelector('div')!;
      const outer = getComputedStyle(root).borderTopColor;
      const divider = getComputedStyle(field()!).borderLeftColor;

      expect(divider).toBe(outer);
      expect(getComputedStyle(field()!).borderRightColor).toBe(outer);
    });

    it('moves the dividers with the focus border', () => {
      const root = host().querySelector('div')!;
      const sheets = Array.from(document.querySelectorAll('style'))
        .map((s) => s.textContent ?? '')
        .filter((text) => Array.from(root.classList).some((c) => text.includes(`.${c}`)))
        .join('');

      // Otherwise a focused control is amber outside and grey down the middle.
      // Emotion serializes the child combinator without spaces.
      expect(sheets).toContain(':has(input:focus)>input');
      expect(sheets).toMatch(/:has\(input:focus\)>input\{border-left:/);
    });
  });

  describe('sizing', () => {
    it('takes its outer height from the theme size, buttons square at it', () => {
      for (const [size, height] of [
        ['sm', 24],
        ['md', 32],
        ['lg', 40],
      ] as const) {
        set('size', size);
        const root = host().querySelector('div')!;
        // Border-box, so this is the outer height and a md stepper lines up
        // with the 32px field beside it.
        expect(getComputedStyle(root).height).toBe(`${height}px`);
        expect(getComputedStyle(root).boxSizing).toBe('border-box');
        expect(getComputedStyle(increase()).width).toBe(`${height}px`);
      }
    });
  });
});
