/**
 * The keyboard map, the parse table, the precision cases and the ARIA
 * contract. Ported from the prototype's Playwright assertions in
 * `packages/angular/prototypes/number-input/test.mjs`.
 *
 * The exact arithmetic and the locale parsing have their own unit tests in
 * `cdk/number`; what is checked here is the field's behaviour around them —
 * what commits, what is refused, what is announced, and what the DOM says.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniNumberInputComponent } from './number-input.component';

describe('UniNumberInputComponent', () => {
  let fixture: ComponentFixture<UniNumberInputComponent>;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const field = (): HTMLInputElement => host().querySelector('input')!;
  const buttons = (): HTMLButtonElement[] => Array.from(host().querySelectorAll('button'));
  const live = (): string => host().querySelector('[role="status"]')!.textContent!.trim();

  const type = (text: string): void => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const press = (key: string, init: KeyboardEventInit = {}): void => {
    field().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
    fixture.detectChanges();
  };

  const blur = (): void => {
    field().dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
  };

  const focus = (): void => {
    field().dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
  };

  const set = (name: string, value: unknown): void => {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniNumberInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniNumberInputComponent);
    fixture.componentRef.setInput('label', 'Quantity');
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.detectChanges();
  });

  describe('ARIA contract', () => {
    it('is a text input with the spinbutton role', () => {
      // type="text" is deliberate: it is the only way to keep the user's
      // malformed text, which type="number" reports as an empty value.
      expect(field().getAttribute('type')).toBe('text');
      expect(field().getAttribute('role')).toBe('spinbutton');
      expect(field().getAttribute('aria-label')).toBe('Quantity');
    });

    it('omits aria-valuenow while empty and says Empty instead', () => {
      expect(field().getAttribute('aria-valuenow')).toBeNull();
      expect(field().getAttribute('aria-valuetext')).toBe('Empty');
    });

    it('reports the bounds only when they exist', () => {
      expect(field().getAttribute('aria-valuemin')).toBeNull();
      set('min', 1);
      set('max', 99);
      expect(field().getAttribute('aria-valuemin')).toBe('1');
      expect(field().getAttribute('aria-valuemax')).toBe('99');
    });

    it('carries the affixes in aria-valuetext, not just the number', () => {
      set('currency', 'USD');
      fixture.componentInstance.value.set(1234.56);
      fixture.detectChanges();

      expect(field().getAttribute('aria-valuenow')).toBe('1234.56');
      expect(field().getAttribute('aria-valuetext')).toBe('$1,234.56');
    });

    it('speaks a unit long form when the visible suffix is abbreviated', () => {
      set('suffix', 'kg');
      set('unitAnnouncement', 'kilograms');
      fixture.componentInstance.value.set(72);
      fixture.detectChanges();

      expect(field().getAttribute('aria-valuetext')).toBe('72 kilograms');
    });

    it('hides the adornments from the reader, since valuetext speaks them', () => {
      set('currency', 'USD');
      const affix = host().querySelector('span[aria-hidden="true"]');
      expect(affix?.textContent?.trim()).toBe('$');
    });

    it('keeps the stepper buttons out of the tab order but named', () => {
      const named = buttons().map((b) => [b.tabIndex, b.getAttribute('aria-label')]);
      expect(named).toContainEqual([-1, 'Increase Quantity']);
      expect(named).toContainEqual([-1, 'Decrease Quantity']);
    });

    it('picks inputmode so the keypad has the keys the field needs', () => {
      set('preset', 'integer');
      set('min', 0);
      expect(field().getAttribute('inputmode')).toBe('numeric');

      set('min', -5);
      expect(field().getAttribute('inputmode')).toBe('decimal');
    });

    it('gates aria-invalid on touched or dirty', () => {
      set('invalid', true);
      expect(field().getAttribute('aria-invalid')).toBeNull();

      blur();
      expect(field().getAttribute('aria-invalid')).toBe('true');
    });

    it('marks itself readonly rather than hiding the value', () => {
      set('readOnly', true);
      expect(field().getAttribute('aria-readonly')).toBe('true');
      expect(field().readOnly).toBe(true);
      // Steppers are pointer affordances; a read-only field has none.
      expect(buttons()).toHaveLength(0);
    });
  });

  describe('display', () => {
    it('formats on commit and reverts to raw text on focus', () => {
      set('currency', 'USD');
      fixture.componentInstance.value.set(1234.5);
      fixture.detectChanges();

      expect(field().value).toBe('1,234.50');

      focus();
      expect(field().value).toBe('1234.5');

      blur();
      expect(field().value).toBe('1,234.50');
    });

    it('leaves the field empty for a null value', () => {
      expect(field().value).toBe('');
    });

    it('honours the align input over the theme default', () => {
      set('align', 'end');
      expect(getComputedStyle(field()).textAlign).toBe('end');
    });
  });

  describe('typed entry', () => {
    it('commits canonical text on Enter', () => {
      focus();
      type('1234.56');
      press('Enter');
      expect(fixture.componentInstance.value()).toBe(1234.56);
    });

    it('commits locale-grouped text the platform control would empty', () => {
      focus();
      type('1,234.56');
      press('Enter');
      expect(fixture.componentInstance.value()).toBe(1234.56);
    });

    it('commits on blur when commitOnBlur is set', () => {
      focus();
      type('42');
      blur();
      expect(fixture.componentInstance.value()).toBe(42);
    });

    it('keeps unreadable text in the field, flagged, and says why', () => {
      focus();
      type('12..5');
      press('Enter');

      // The text is NOT swallowed — a field that empties itself has lost your
      // work and told you nothing.
      expect(field().value).toBe('12..5');
      expect(fixture.componentInstance.value()).toBeNull();
      expect(field().getAttribute('aria-invalid')).toBe('true');
      expect(live()).toBe('12..5 is not a number.');
    });

    it('emits rejected with a reason', () => {
      const rejected: unknown[] = [];
      fixture.componentInstance.rejected.subscribe((r) => rejected.push(r));

      focus();
      type('abc');
      press('Enter');

      expect(rejected).toEqual([{ raw: 'abc', reason: 'unparseable' }]);
    });

    it('clears the invalid flag as soon as the text is edited', () => {
      focus();
      type('abc');
      press('Enter');
      expect(field().getAttribute('aria-invalid')).toBe('true');

      type('ab');
      expect(field().getAttribute('aria-invalid')).toBeNull();
    });

    it('reverts the draft on Escape', () => {
      fixture.componentInstance.value.set(10);
      fixture.detectChanges();

      focus();
      type('999');
      press('Escape');

      expect(fixture.componentInstance.value()).toBe(10);
      expect(field().value).toBe('10');
    });

    it('commits an empty field as null, not zero', () => {
      fixture.componentInstance.value.set(5);
      fixture.detectChanges();

      focus();
      type('');
      press('Enter');

      expect(fixture.componentInstance.value()).toBeNull();
    });

    it('refuses a fraction under the integer preset', () => {
      set('preset', 'integer');
      focus();
      type('1.5');
      press('Enter');

      expect(fixture.componentInstance.value()).toBeNull();
      expect(live()).toContain('whole number');
    });

    it('evaluates expressions only when allowed, and never truncates', () => {
      focus();
      type('12*3');
      press('Enter');
      // Off by default: a field that silently truncates 12*3 to 12 is worse
      // than one that refuses it.
      expect(fixture.componentInstance.value()).toBeNull();

      set('allowExpressions', true);
      type('12*3');
      press('Enter');
      expect(fixture.componentInstance.value()).toBe(36);
      expect(live()).toBe('36.');
    });

    it('uses a custom parser when given one', () => {
      set('parse', (raw: string) => (raw === 'dozen' ? '12' : null));
      focus();
      type('dozen');
      press('Enter');
      expect(fixture.componentInstance.value()).toBe(12);
    });
  });

  describe('clamping', () => {
    it('clamps on commit, never per keystroke', () => {
      set('min', 10);
      focus();
      // A field that clamps live can never be typed into: the 1 would become
      // 10 before the 5 arrives.
      type('1');
      expect(fixture.componentInstance.value()).toBeNull();
      type('15');
      press('Enter');
      expect(fixture.componentInstance.value()).toBe(15);
    });

    it('clamps an out-of-range commit and announces it', () => {
      set('max', 100);
      focus();
      type('150');
      press('Enter');

      expect(fixture.componentInstance.value()).toBe(100);
      expect(live()).toBe('Maximum is 100. Value set to 100.');
    });

    it('refuses instead of clamping when clampOnCommit is off', () => {
      set('max', 100);
      set('clampOnCommit', false);
      focus();
      type('150');
      press('Enter');

      expect(fixture.componentInstance.value()).toBeNull();
      expect(field().value).toBe('150');
      expect(live()).toContain('above the maximum');
    });
  });

  describe('stepping', () => {
    it('steps on the arrow keys and commits immediately', () => {
      fixture.componentInstance.value.set(5);
      fixture.detectChanges();

      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(6);

      press('ArrowDown');
      expect(fixture.componentInstance.value()).toBe(5);
    });

    it('steps decimals exactly', () => {
      set('step', 0.1);
      fixture.componentInstance.value.set(0.2);
      fixture.detectChanges();

      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(0.3);
    });

    it('uses largeStep for Shift+Arrow and PageUp/PageDown', () => {
      fixture.componentInstance.value.set(0);
      fixture.detectChanges();

      // Default large step is step × 10.
      press('ArrowUp', { shiftKey: true });
      expect(fixture.componentInstance.value()).toBe(10);

      press('PageDown');
      expect(fixture.componentInstance.value()).toBe(0);

      set('largeStep', 25);
      press('PageUp');
      expect(fixture.componentInstance.value()).toBe(25);
    });

    it('uses smallStep for Alt+Arrow only when set', () => {
      fixture.componentInstance.value.set(1);
      fixture.detectChanges();

      // Unset means disabled, not "fall back to step".
      press('ArrowUp', { altKey: true });
      expect(fixture.componentInstance.value()).toBe(1);

      set('smallStep', 0.1);
      press('ArrowUp', { altKey: true });
      expect(fixture.componentInstance.value()).toBe(1.1);
    });

    it('lands on the min-anchored grid and snaps toward travel', () => {
      set('min', 5);
      set('step', 10);
      fixture.componentInstance.value.set(7);
      fixture.detectChanges();

      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(15);
    });

    it('seeds an empty field rather than producing NaN', () => {
      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(0);

      fixture.componentInstance.value.set(null);
      set('min', 1);
      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(1);

      fixture.componentInstance.value.set(null);
      set('emptyStepValue', 7);
      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(7);
    });

    it('announces the fence instead of silently doing nothing', () => {
      set('max', 10);
      fixture.componentInstance.value.set(10);
      fixture.detectChanges();

      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(10);
      expect(live()).toBe('Maximum, 10.');
    });

    it('disables the stepper at the fence it cannot pass', () => {
      set('min', 0);
      set('max', 10);
      fixture.componentInstance.value.set(10);
      fixture.detectChanges();

      const increase = buttons().find((b) => b.getAttribute('aria-label') === 'Increase Quantity');
      const decrease = buttons().find((b) => b.getAttribute('aria-label') === 'Decrease Quantity');
      expect(increase?.disabled).toBe(true);
      expect(decrease?.disabled).toBe(false);
    });

    it('cycles at the fence when wrap is set', () => {
      set('min', 0);
      set('max', 23);
      set('wrap', true);
      fixture.componentInstance.value.set(23);
      fixture.detectChanges();

      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(0);

      press('ArrowDown');
      expect(fixture.componentInstance.value()).toBe(23);
    });

    it('jumps to a fence on Home and End, and no-ops when unbounded', () => {
      fixture.componentInstance.value.set(5);
      fixture.detectChanges();

      // Nothing sensible lives at an unbounded fence.
      press('Home');
      expect(fixture.componentInstance.value()).toBe(5);

      set('min', 1);
      set('max', 99);
      press('Home');
      expect(fixture.componentInstance.value()).toBe(1);
      press('End');
      expect(fixture.componentInstance.value()).toBe(99);
    });

    it('commits a typed draft before stepping from it', () => {
      focus();
      type('41');
      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(42);
    });

    it('emits stepped with the from/to pair', () => {
      const steps: unknown[] = [];
      fixture.componentInstance.stepped.subscribe((s) => steps.push(s));

      fixture.componentInstance.value.set(5);
      fixture.detectChanges();
      press('ArrowUp');

      expect(steps).toEqual([{ from: 5, to: 6, by: 1 }]);
    });

    it('does not step while read-only or disabled', () => {
      fixture.componentInstance.value.set(5);
      set('readOnly', true);
      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(5);

      set('readOnly', false);
      set('disabled', true);
      press('ArrowUp');
      expect(fixture.componentInstance.value()).toBe(5);
    });
  });

  describe('percent and fractions', () => {
    it('never divides a percent value behind the user', () => {
      set('preset', 'percent');
      fixture.componentInstance.value.set(15);
      fixture.detectChanges();

      expect(field().value).toBe('15');
      expect(fixture.componentInstance.value()).toBe(15);
      expect(field().getAttribute('aria-valuetext')).toBe('15 percent');
    });

    it('shifts display units when the model is a fraction', () => {
      set('preset', 'percent');
      set('valueIsFraction', true);
      fixture.componentInstance.value.set(0.15);
      fixture.detectChanges();

      expect(field().value).toBe('15');

      focus();
      type('16');
      press('Enter');
      expect(fixture.componentInstance.value()).toBe(0.16);
    });
  });

  describe('exact binding', () => {
    it('keeps valueAsString and value in sync', () => {
      focus();
      type('1234.56');
      press('Enter');

      expect(fixture.componentInstance.value()).toBe(1234.56);
      expect(fixture.componentInstance.valueAsString()).toBe('1234.56');
    });

    it('carries digits a number cannot', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentInstance.valueAsString.set('9007199254740993');
      fixture.detectChanges();

      // The exact model keeps every digit; `value` is the lossy projection,
      // and the projection echoing back must not clobber the string.
      expect(fixture.componentInstance.valueAsString()).toBe('9007199254740993');
      expect(fixture.componentInstance.value()).toBe(9007199254740992);
      expect(field().getAttribute('aria-valuenow')).toBe('9007199254740993');
      warn.mockRestore();
    });

    it('warns once in dev when a bound value cannot round-trip', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      fixture.componentInstance.valueAsString.set('9007199254740993');
      fixture.detectChanges();
      fixture.detectChanges();

      const mine = warn.mock.calls.filter((call) =>
        String(call[0]).includes('cannot round-trip')
      );
      expect(mine).toHaveLength(1);
      expect(String(mine[0][0])).toContain('valueAsString');
      warn.mockRestore();
    });

    it('adopts an external write to value even when the exact model is stale', () => {
      focus();
      type('10');
      press('Enter');
      expect(fixture.componentInstance.valueAsString()).toBe('10');

      // An app binding only [(value)] must not be overridden by the old string.
      fixture.componentInstance.value.set(42);
      fixture.detectChanges();
      expect(fixture.componentInstance.valueAsString()).toBe('42');
      expect(field().value).toBe('42');

      fixture.componentInstance.value.set(null);
      fixture.detectChanges();
      expect(fixture.componentInstance.valueAsString()).toBeNull();
      expect(field().value).toBe('');
    });
  });

  describe('stepper layouts', () => {
    it('renders two buttons by default and none when told', () => {
      expect(buttons()).toHaveLength(2);

      set('stepperLayout', 'none');
      expect(buttons()).toHaveLength(0);
    });

    it('renders both buttons in every visible layout', () => {
      for (const layout of ['stacked', 'split', 'trailing'] as const) {
        set('stepperLayout', layout);
        expect(buttons()).toHaveLength(2);
      }
    });
  });

  describe('coarse pointers', () => {
    /** Two stacked 16px arrows under a fingertip is a coin toss, so the
        component swaps itself to the full-height split layout. */
    const withPointer = async (kind: 'coarse' | 'fine') => {
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches: query.includes('pointer: coarse') && kind === 'coarse',
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }));
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [UniNumberInputComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(UniNumberInputComponent);
      fixture.componentRef.setInput('label', 'Quantity');
      fixture.detectChanges();
    };

    afterEach(() => vi.unstubAllGlobals());

    it('promotes the stacked layout to split on a coarse pointer', async () => {
      await withPointer('coarse');
      // Split buttons are full-height squares, so both clear the 24px floor.
      const styles = buttons().map((b) => getComputedStyle(b).width);
      expect(styles.every((w) => w === '32px')).toBe(true);
      expect(buttons()).toHaveLength(2);
    });

    it('leaves an explicitly chosen layout alone', async () => {
      await withPointer('coarse');
      set('stepperLayout', 'trailing');
      expect(buttons()).toHaveLength(2);
    });

    it('keeps the stacked layout on a fine pointer', async () => {
      await withPointer('fine');
      expect(buttons()).toHaveLength(2);
    });
  });

  describe('wheel', () => {
    it('ignores the wheel unless enabled and focused', () => {
      fixture.componentInstance.value.set(5);
      fixture.detectChanges();

      field().dispatchEvent(new WheelEvent('wheel', { deltaY: -1 }));
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toBe(5);

      set('wheel', true);
      // Still not focused — a page being scrolled past must not change values.
      field().dispatchEvent(new WheelEvent('wheel', { deltaY: -1 }));
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toBe(5);

      focus();
      field().dispatchEvent(new WheelEvent('wheel', { deltaY: -1 }));
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toBe(6);
    });
  });
});
