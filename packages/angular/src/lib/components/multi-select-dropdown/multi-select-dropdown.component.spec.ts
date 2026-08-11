/**
 * First specs for this component — it shipped with none, which is why its
 * accessible name had been missing since it was written.
 *
 * The popover renders into the top layer, so the panel is queried from
 * `document`, not from the fixture host.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniMultiSelectDropdownComponent } from './multi-select-dropdown.component';

describe('UniMultiSelectDropdownComponent', () => {
  let fixture: ComponentFixture<UniMultiSelectDropdownComponent<string>>;
  let host: HTMLElement;

  const OPTIONS = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
  ];

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const trigger = () => host.querySelector<HTMLButtonElement>('button')!;
  const panel = () => document.querySelector<HTMLElement>('[popover]')!;
  const checkboxes = () => Array.from(panel().querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
  const filterBox = () => panel().querySelector<HTMLInputElement>('input[type="text"]')!;

  /**
   * Accessible name: visible text minus `aria-hidden` parts. Element
   * boundaries are joined with a space, the way assistive tech separates them
   * — raw `textContent` would run "Fruits," straight into "2 selected".
   */
  const accessibleName = (el: Element) => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());

    const parts: string[] = [];
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) parts.push(node.textContent ?? '');
      else node.childNodes.forEach(walk);
    };
    walk(clone);
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };

  const open = () => {
    trigger().click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniMultiSelectDropdownComponent],
    }).compileComponents();
    fixture = TestBed.createComponent<UniMultiSelectDropdownComponent<string>>(
      UniMultiSelectDropdownComponent
    );
    host = fixture.nativeElement;
    document.body.appendChild(host);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
  });

  afterEach(() => host.remove());

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('accessible name', () => {
    it('announces the field, then how much is selected, then the selection', () => {
      setInputs({ label: 'Fruits', value: ['apple', 'cherry'] });

      // Without the label the button announced only "Apple, Cherry" — a
      // screen reader user had no way to tell which field it belonged to.
      expect(accessibleName(trigger())).toBe('Fruits, 2 selected Apple, Cherry');
    });

    it('says so when nothing is selected', () => {
      setInputs({ label: 'Fruits', placeholder: 'Pick some fruit' });
      expect(accessibleName(trigger())).toContain('none selected');
    });

    it('still works without a label, for existing callers', () => {
      setInputs({ value: ['apple'] });
      expect(accessibleName(trigger())).toContain('Apple');
    });
  });

  describe('selection', () => {
    it('renders a checkbox per option, reflecting the current value', () => {
      setInputs({ value: ['banana'] });
      open();

      expect(checkboxes()).toHaveLength(3);
      expect(checkboxes().map((box) => box.checked)).toEqual([false, true, false]);
    });

    it('toggles a value on and off, keeping the rest', () => {
      setInputs({ value: ['banana'] });
      open();

      checkboxes()[0].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toEqual(['banana', 'apple']);

      checkboxes()[1].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toEqual(['apple']);
    });

    it('marks the control touched on interaction', () => {
      open();
      checkboxes()[0].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.touched()).toBe(true);
    });

    it('selectAll and deselectAll cover every option', () => {
      fixture.componentInstance.selectAll();
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toEqual(['apple', 'banana', 'cherry']);

      fixture.componentInstance.deselectAll();
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toEqual([]);
    });

    it('changes nothing while disabled', () => {
      setInputs({ disabled: true, value: ['apple'] });

      fixture.componentInstance.selectAll();
      fixture.componentInstance.deselectAll();
      fixture.detectChanges();

      expect(fixture.componentInstance.value()).toEqual(['apple']);
    });
  });

  describe('filtering', () => {
    const typeFilter = async (text: string) => {
      filterBox().value = text;
      filterBox().dispatchEvent(new Event('input'));
      // The filter is debounced so a long list is not re-filtered per keystroke.
      await new Promise((resolve) => setTimeout(resolve, 30));
      fixture.detectChanges();
    };

    beforeEach(() => {
      setInputs({ debounceTime: 1 });
      open();
    });

    it('narrows the options', async () => {
      await typeFilter('an');
      expect(checkboxes()).toHaveLength(1);
    });

    it('debounces rather than filtering on every keystroke', () => {
      filterBox().value = 'an';
      filterBox().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Not yet — the debounce has not elapsed.
      expect(checkboxes()).toHaveLength(3);
    });

    it('reports an empty result instead of showing nothing', async () => {
      await typeFilter('zzz');

      expect(checkboxes()).toHaveLength(0);
      expect(panel().querySelector('[role="status"]')?.textContent).toContain('No options match');
    });

    it('keeps selections that the filter has hidden', async () => {
      setInputs({ value: ['apple'] });
      await typeFilter('cher');

      expect(fixture.componentInstance.value()).toEqual(['apple']);
    });
  });

  describe('keyboard navigation', () => {
    /**
     * Dispatched on the filter box so it bubbles up through the panel — the
     * handler sits on a wrapper *inside* the popover, so an event fired on the
     * popover itself would never reach it.
     */
    const arrow = (key: string) => {
      filterBox().dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      );
      fixture.detectChanges();
    };

    beforeEach(() => open());

    it('walks the options with arrows from anywhere in the panel', () => {
      // Previously the only way in was to Tab through every checkbox.
      arrow('ArrowDown');
      expect(document.activeElement).toBe(checkboxes()[0]);

      arrow('ArrowDown');
      expect(document.activeElement).toBe(checkboxes()[1]);

      arrow('ArrowUp');
      expect(document.activeElement).toBe(checkboxes()[0]);
    });

    it('wraps at both ends', () => {
      arrow('ArrowUp');
      expect(document.activeElement).toBe(checkboxes()[2]);

      arrow('ArrowDown');
      expect(document.activeElement).toBe(checkboxes()[0]);
    });

    it('jumps to the ends with Home and End', () => {
      arrow('End');
      expect(document.activeElement).toBe(checkboxes()[2]);

      arrow('Home');
      expect(document.activeElement).toBe(checkboxes()[0]);
    });

    it('leaves other keys alone so typing still reaches the filter box', () => {
      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
      filterBox().dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('form control contract', () => {
    it('gates aria-invalid on touched or dirty', () => {
      setInputs({ invalid: true });
      expect(trigger().getAttribute('aria-invalid')).toBeNull();

      setInputs({ touched: true });
      expect(trigger().getAttribute('aria-invalid')).toBe('true');
    });

    it('exposes required and describedby', () => {
      setInputs({ required: true, ariaDescribedBy: 'err-1' });

      expect(trigger().getAttribute('aria-required')).toBe('true');
      expect(trigger().getAttribute('aria-describedby')).toBe('err-1');
    });

    it('groups the options under the field name', () => {
      setInputs({ label: 'Fruits' });
      open();

      expect(panel().querySelector('[role="group"]')?.getAttribute('aria-label')).toBe(
        'Fruits options'
      );
    });
  });
});
