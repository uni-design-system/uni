/**
 * Behaviours ported from the vanilla prototype's Playwright suite
 * (`packages/angular/prototypes/combobox/test.mjs`), which asserted them
 * against the design before it was committed to Angular.
 *
 * The query/result-count announcements ride a setTimeout even at
 * `debounceTime: 0`, so tests that assert them await `tick0()` (a macrotask),
 * not just `flush()` (a microtask).
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Option, Options } from '../../cdk';
import { UniComboboxComponent } from './combobox.component';

const STATES: Options<string> = [
  { label: 'Alabama', value: 'AL', description: 'Montgomery' },
  { label: 'Alaska', value: 'AK', description: 'Juneau' },
  { label: 'Arizona', value: 'AZ', description: 'Phoenix' },
  { label: 'Arkansas', value: 'AR', description: 'Little Rock' },
  { label: 'California', value: 'CA', description: 'Sacramento' },
  { label: 'Colorado', value: 'CO', description: 'Denver' },
];

const ASSIGNEES: Options<string> = [
  { label: 'Alice Chen', value: 'u1', description: 'alice@uni.dev' },
  { label: 'Ben Okafor', value: 'u2', description: 'ben@uni.dev' },
  { label: 'Dmitri Volkov', value: 'u3', description: 'dmitri@partners.io' },
  { label: 'Priya Raman', value: 'u4', description: 'OOO until Sep 2', disabled: true },
  { label: 'Sam Whitfield', value: 'u5', description: 'OOO until Aug 29', disabled: true },
  { label: 'Tessa Morgan', value: 'u6', description: 'tessa@uni.dev' },
];

describe('UniComboboxComponent', () => {
  let fixture: ComponentFixture<UniComboboxComponent<string>>;
  let host: HTMLElement;

  const flush = async () => {
    await Promise.resolve();
    fixture.detectChanges();
  };

  /** The debounce timer is a macrotask even at zero delay. */
  const tick0 = async () => {
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  };

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const field = () => host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  const listbox = () => host.querySelector<HTMLElement>('[role="listbox"]');
  const options = () => Array.from(host.querySelectorAll<HTMLElement>('[role="option"]'));
  const optionLabels = () =>
    options().map((el) => el.querySelector('.option-label')?.textContent?.trim());
  const activeOption = () => host.querySelector<HTMLElement>('[role="option"].active');
  const clearButton = () => host.querySelector<HTMLButtonElement>('button[icon-button]');
  const toggleButton = () => host.querySelector<HTMLButtonElement>('button[aria-hidden="true"]')!;
  const liveText = () => host.querySelector('[role="status"]')?.textContent?.trim();
  const expanded = () => field().getAttribute('aria-expanded');

  /** Type into the field the way a user does. */
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

  const click = (target: HTMLElement) => {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };

  const blurField = () => {
    field().dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniComboboxComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniComboboxComponent<string>);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('label', 'State');
    fixture.componentRef.setInput('options', STATES);
    fixture.componentRef.setInput('debounceTime', 0);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('opening', () => {
    it('starts closed with no clear affordance', () => {
      expect(listbox()).toBeNull();
      expect(expanded()).toBe('false');
      expect(clearButton()).toBeNull();
    });

    it('opens the full list on field click, with nothing active while no value is set', () => {
      click(field());
      expect(options().length).toBe(STATES.length);
      expect(field().getAttribute('aria-activedescendant')).toBeNull();
    });

    it('opens on ArrowDown landing on the committed option', () => {
      setInputs({ value: 'AZ' });
      press('ArrowDown');
      expect(activeOption()?.textContent).toContain('Arizona');
      expect(field().getAttribute('aria-activedescendant')).toBe(activeOption()?.id);
    });

    it('opens on ArrowUp landing on the last option', () => {
      press('ArrowUp');
      expect(activeOption()?.textContent).toContain('Colorado');
    });

    it('opens without activating on Alt+ArrowDown', () => {
      press('ArrowDown', { altKey: true });
      expect(options().length).toBe(STATES.length);
      expect(activeOption()).toBeNull();
    });

    it('closes on Alt+ArrowUp keeping the draft', () => {
      type('ala');
      press('ArrowUp', { altKey: true });
      expect(listbox()).toBeNull();
      expect(field().value).toBe('ala');
    });

    it('keeps the toggle out of the tab order and toggles on mousedown', () => {
      const toggle = toggleButton();
      expect(toggle.tabIndex).toBe(-1);

      toggle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(listbox()).not.toBeNull();

      toggle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(listbox()).toBeNull();
    });

    it('never opens on focus alone', () => {
      field().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      fixture.detectChanges();
      expect(listbox()).toBeNull();
    });
  });

  describe('filtering', () => {
    it('narrows the list as the user types, activating nothing', () => {
      type('ala');
      expect(optionLabels()).toEqual(['Alabama', 'Alaska']);
      expect(activeOption()).toBeNull();
    });

    it('renders a non-interactive empty row when nothing matches', () => {
      type('zz');
      expect(options().length).toBe(0);
      expect(listbox()?.textContent).toContain('No matches');
      expect(expanded()).toBe('true');
    });

    it('announces the result count after the debounce', async () => {
      type('ala');
      await tick0();
      expect(liveText()).toBe('2 results.');

      type('zz');
      await tick0();
      expect(liveText()).toBe('No matches.');
    });

    it('respects a custom filterWith', () => {
      setInputs({
        filterWith: (option: Option<string>, query: string) =>
          option.description?.toLowerCase().includes(query.toLowerCase()) ?? false,
      });
      type('juneau');
      expect(optionLabels()).toEqual(['Alaska']);
    });
  });

  describe('draft resolution', () => {
    it('commits the active option on Enter (rule 1)', () => {
      const selected: Option<string>[] = [];
      fixture.componentInstance.selected.subscribe((option) => selected.push(option));

      press('ArrowDown');
      press('ArrowDown');
      press('Enter');

      expect(fixture.componentInstance.value()).toBe('AK');
      expect(field().value).toBe('Alaska');
      expect(listbox()).toBeNull();
      expect(selected.map((option) => option.value)).toEqual(['AK']);
    });

    it('commits a unique exact label match on Enter, case-insensitively (rule 2)', () => {
      type('alabama');
      press('Enter');
      expect(fixture.componentInstance.value()).toBe('AL');
    });

    it('commits an exact-match draft on blur (rule 2)', () => {
      type('Colorado');
      blurField();
      expect(fixture.componentInstance.value()).toBe('CO');
    });

    it('commits when the filter narrows to one option on Enter (rule 3)', () => {
      type('alab');
      press('Enter');
      expect(fixture.componentInstance.value()).toBe('AL');
      expect(field().value).toBe('Alabama');
    });

    it('never applies rule 3 on blur: an inexact draft reverts and is rejected', () => {
      const rejections: string[] = [];
      fixture.componentInstance.rejected.subscribe(({ query }) => rejections.push(query));

      type('alab');
      blurField();

      expect(fixture.componentInstance.value()).toBeNull();
      expect(field().value).toBe('');
      expect(rejections).toEqual(['alab']);
    });

    it('keeps the list open and announces when Enter has nothing to commit', () => {
      type('a');
      press('Enter');
      expect(listbox()).not.toBeNull();
      expect(fixture.componentInstance.value()).toBeNull();
      expect(liveText()).toContain('results');
    });

    it('treats an emptied field on blur as a deliberate clear', () => {
      const cleared: number[] = [];
      fixture.componentInstance.cleared.subscribe(() => cleared.push(1));

      setInputs({ value: 'AL' });
      type('');
      blurField();

      expect(fixture.componentInstance.value()).toBeNull();
      expect(cleared.length).toBe(1);
    });

    it('never nulls the model from an emptied field when not clearable', () => {
      setInputs({ value: 'AL', clearable: false });
      type('');
      blurField();

      expect(fixture.componentInstance.value()).toBe('AL');
      expect(field().value).toBe('Alabama');
    });

    it('reverts silently on blur when commitOnBlur is off', () => {
      const rejections: string[] = [];
      fixture.componentInstance.rejected.subscribe(({ query }) => rejections.push(query));

      setInputs({ commitOnBlur: false });
      type('Colorado');
      blurField();

      expect(fixture.componentInstance.value()).toBeNull();
      expect(field().value).toBe('');
      expect(rejections).toEqual([]);
    });

    it('marks the field touched on blur', () => {
      blurField();
      expect(fixture.componentInstance.touched()).toBe(true);
    });
  });

  describe('keyboard', () => {
    it('wraps at both ends', () => {
      press('ArrowUp'); // last
      press('ArrowDown');
      expect(activeOption()?.textContent).toContain('Alabama');

      press('ArrowUp');
      expect(activeOption()?.textContent).toContain('Colorado');
    });

    it('jumps with Home and End while open, leaving the caret alone while closed', () => {
      const closedEvent = press('Home');
      expect(closedEvent.defaultPrevented).toBe(false);
      expect(listbox()).toBeNull();

      press('ArrowDown');
      press('End');
      expect(activeOption()?.textContent).toContain('Colorado');
      press('Home');
      expect(activeOption()?.textContent).toContain('Alabama');
    });

    it('backs out one layer per Escape: close, then revert — never clearing the value', () => {
      setInputs({ value: 'AL' });
      type('colo');
      expect(listbox()).not.toBeNull();

      press('Escape');
      expect(listbox()).toBeNull();
      expect(field().value).toBe('colo');

      press('Escape');
      expect(field().value).toBe('Alabama');

      press('Escape');
      expect(fixture.componentInstance.value()).toBe('AL');
    });

    it('prevents Enter only while the list is open', () => {
      const closedEnter = press('Enter');
      expect(closedEnter.defaultPrevented).toBe(false);

      press('ArrowDown');
      const openEnter = press('Enter');
      expect(openEnter.defaultPrevented).toBe(true);
    });

    it('resolves on Tab without trapping focus', () => {
      press('ArrowDown');
      const event = press('Tab');

      expect(fixture.componentInstance.value()).toBe('AL');
      // Tab must stay un-prevented or the field becomes a keyboard trap.
      expect(event.defaultPrevented).toBe(false);
      expect(listbox()).toBeNull();
    });
  });

  describe('disabled options', () => {
    beforeEach(() => setInputs({ label: 'Assignee', options: ASSIGNEES }));

    it('renders disabled options visibly, with descriptions, marked aria-disabled', () => {
      click(field());
      const priya = options()[3];
      expect(priya.getAttribute('aria-disabled')).toBe('true');
      expect(priya.textContent).toContain('OOO until Sep 2');
    });

    it('skips disabled options with the arrows, in both directions', () => {
      press('ArrowDown'); // Alice
      press('ArrowDown'); // Ben
      press('ArrowDown'); // Dmitri
      press('ArrowDown'); // skips Priya and Sam
      expect(activeOption()?.textContent).toContain('Tessa Morgan');

      press('ArrowUp');
      expect(activeOption()?.textContent).toContain('Dmitri Volkov');
    });

    it('wraps over disabled options at the end of the list', () => {
      press('ArrowUp'); // Tessa (last enabled)
      press('ArrowDown'); // wraps to Alice
      expect(activeOption()?.textContent).toContain('Alice Chen');
    });

    it('refuses to commit a disabled option by click', () => {
      click(field());
      click(options()[3]);
      expect(fixture.componentInstance.value()).toBeNull();
      expect(listbox()).not.toBeNull();

      click(options()[5]);
      expect(fixture.componentInstance.value()).toBe('u6');
    });
  });

  describe('clear', () => {
    it('shows the clear button only while a value is set and the field is enabled', () => {
      expect(clearButton()).toBeNull();

      setInputs({ value: 'AL' });
      expect(clearButton()).not.toBeNull();

      setInputs({ disabled: true });
      expect(clearButton()).toBeNull();
    });

    it('clears to null, empties the field, refocuses and announces', async () => {
      const cleared: number[] = [];
      fixture.componentInstance.cleared.subscribe(() => cleared.push(1));

      setInputs({ value: 'AL' });
      click(clearButton()!);
      await flush();

      expect(fixture.componentInstance.value()).toBeNull();
      expect(field().value).toBe('');
      expect(document.activeElement).toBe(field());
      expect(liveText()).toBe('Selection cleared.');
      expect(cleared.length).toBe(1);
    });
  });

  describe('async (filterLocally=false)', () => {
    beforeEach(() => setInputs({ filterLocally: false, options: [] }));

    it('renders the options input verbatim, without local narrowing', () => {
      setInputs({ options: STATES.slice(0, 3) });
      type('zzz');
      expect(options().length).toBe(3);
    });

    it('emits the draft through query, debounced', async () => {
      const queries: string[] = [];
      fixture.componentInstance.query.subscribe((query) => queries.push(query));

      type('col');
      expect(queries).toEqual([]);
      await tick0();
      expect(queries).toEqual(['col']);
    });

    it('narrows from swapped-in options and commits against them', () => {
      type('col');
      setInputs({ options: [STATES[5]] });
      expect(optionLabels()).toEqual(['Colorado']);

      press('Enter'); // rule 3: one enabled option
      expect(fixture.componentInstance.value()).toBe('CO');
    });
  });

  describe('ARIA', () => {
    it('wires expanded, controls and the listbox label', () => {
      expect(expanded()).toBe('false');
      click(field());
      expect(expanded()).toBe('true');
      expect(field().getAttribute('aria-controls')).toBe(listbox()?.id);
      expect(listbox()?.getAttribute('aria-label')).toBe('State');
    });

    it('marks the committed option selected while a different option is active', () => {
      setInputs({ value: 'AL' });
      press('ArrowDown');
      press('ArrowDown'); // Alaska active, Alabama committed

      const selected = options().filter((el) => el.getAttribute('aria-selected') === 'true');
      expect(selected.length).toBe(1);
      expect(selected[0].textContent).toContain('Alabama');
      expect(activeOption()?.textContent).toContain('Alaska');
      expect(field().getAttribute('aria-activedescendant')).toBe(activeOption()?.id);
    });

    it('hides the committed check icon from assistive tech', () => {
      setInputs({ value: 'AL' });
      click(field());
      const check = options()[0].querySelector('.check');
      expect(check?.getAttribute('aria-hidden')).toBe('true');
      expect(check?.querySelector('uni-icon')).not.toBeNull();
    });

    it('passes required and describedby through to the input', () => {
      setInputs({ required: true, ariaDescribedBy: 'state-error' });
      expect(field().getAttribute('aria-required')).toBe('true');
      expect(field().getAttribute('aria-describedby')).toBe('state-error');
    });

    it('announces commits through the live region', () => {
      type('alaska');
      press('Enter');
      expect(liveText()).toBe('Alaska selected.');
    });
  });

  describe('error gating', () => {
    it('shows aria-invalid only after the field is touched or dirty', () => {
      setInputs({ invalid: true });
      expect(field().getAttribute('aria-invalid')).toBeNull();

      blurField();
      expect(field().getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('value model', () => {
    it('displays the committed label for an externally written value', () => {
      setInputs({ value: 'CA' });
      expect(field().value).toBe('California');
    });

    it('preserves a value with no matching option and self-heals when options arrive', () => {
      setInputs({ options: [], value: 'CA' });
      expect(field().value).toBe('');
      expect(fixture.componentInstance.value()).toBe('CA');

      setInputs({ options: STATES });
      expect(field().value).toBe('California');
    });

    it('matches object-shaped values through compareWith', async () => {
      const objectFixture = TestBed.createComponent(
        UniComboboxComponent<{ id: number }>
      );
      objectFixture.componentRef.setInput('label', 'Team');
      objectFixture.componentRef.setInput('options', [
        { label: 'Design Systems', value: { id: 1 } },
        { label: 'Platform', value: { id: 2 } },
      ]);
      objectFixture.componentRef.setInput(
        'compareWith',
        (a: { id: number }, b: { id: number }) => a?.id === b?.id
      );
      objectFixture.componentRef.setInput('value', { id: 2 });
      objectFixture.detectChanges();

      const input = objectFixture.nativeElement.querySelector('input[role="combobox"]');
      expect(input.value).toBe('Platform');
    });
  });
});
