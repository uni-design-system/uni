import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniContactInputComponent } from './contact-input.component';
import type { UniContact } from './contact-input.model';

const CONTACTS: UniContact[] = [
  { value: 'alice@uni.dev', name: 'Alice Chen', note: 'Design', group: 'On this project' },
  { value: 'bob@uni.dev', name: 'Bob Ferrari', group: 'On this project' },
  { value: 'carol@uni.dev', name: 'Carol Nwosu', group: 'Other contacts' },
  { value: 'u_42', name: 'Priya Raman', email: 'priya@uni.dev', group: 'Other contacts' },
];

describe('UniContactInputComponent', () => {
  let fixture: ComponentFixture<UniContactInputComponent>;
  let host: HTMLElement;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const field = () => host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  const chips = () => Array.from(host.querySelectorAll('uni-tag'));
  const options = () => Array.from(host.querySelectorAll<HTMLElement>('[role="option"]'));
  const values = () => fixture.componentInstance.value().map((contact) => contact.value);

  const focusField = () => {
    field().dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
  };

  const type = (text: string) => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const press = (key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    field().dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniContactInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniContactInputComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('label', 'To');
    fixture.componentRef.setInput('contacts', CONTACTS);
    fixture.detectChanges();
  });

  describe('suggestions', () => {
    it('opens on focus with every contact, grouped', () => {
      focusField();

      expect(options().length).toBe(4);
      const headings = Array.from(host.querySelectorAll('[role="presentation"]'));
      expect(headings.map((h) => h.textContent?.trim())).toEqual([
        'On this project',
        'Other contacts',
      ]);
    });

    it('draws a person: avatar, name, address and note', () => {
      focusField();
      const row = options()[0];

      expect(row.querySelector('uni-avatar')).not.toBeNull();
      expect(row.querySelector('.uni-contact-name')?.textContent).toContain('Alice Chen');
      expect(row.querySelector('.uni-contact-detail')?.textContent).toContain('alice@uni.dev');
      expect(row.querySelector('.uni-contact-note')?.textContent).toContain('Design');
    });

    it('shows `email` under the name when the value is an id', () => {
      focusField();

      expect(options()[3].querySelector('.uni-contact-detail')?.textContent).toContain(
        'priya@uni.dev'
      );
    });

    it('filters by name or address as the user types', () => {
      type('ferr');
      expect(options().length).toBe(1);
      expect(options()[0].textContent).toContain('Bob Ferrari');

      type('carol@');
      expect(options().length).toBe(1);
      expect(options()[0].textContent).toContain('Carol Nwosu');
    });

    it('renders contacts verbatim when filterLocally is off', () => {
      setInputs({ filterLocally: false });
      type('ferr');

      expect(options().length).toBe(4);
    });

    it('hides people already in the value', () => {
      setInputs({ value: [CONTACTS[0]] });
      focusField();

      expect(options().length).toBe(3);
    });
  });

  describe('committing', () => {
    it('highlights nothing until ArrowDown', () => {
      focusField();
      expect(host.querySelector('[role="option"].active')).toBeNull();
      expect(field().getAttribute('aria-activedescendant')).toBeNull();

      type('ali');
      expect(host.querySelector('[role="option"].active')).toBeNull();

      press('ArrowDown');
      expect(options()[0].classList.contains('active')).toBe(true);
    });

    it('with autoHighlight, Enter picks the first match without arrowing', () => {
      setInputs({ autoHighlight: true });
      type('ali');
      press('Enter');

      expect(values()).toEqual(['alice@uni.dev']);
    });

    it('ArrowDown then Enter picks a match and writes the whole contact to the value', () => {
      type('ali');
      press('ArrowDown');
      press('Enter');

      expect(fixture.componentInstance.value()).toEqual([CONTACTS[0]]);
      expect(chips()[0].textContent).toContain('Alice Chen');
      expect(field().value).toBe('');
    });

    it('picks a contact whose value is an id', () => {
      type('priya');
      press('ArrowDown');
      press('Enter');

      expect(values()).toEqual(['u_42']);
    });

    it('accepts a typed address that is not a known contact', () => {
      type('zed@uni.dev');
      press('Enter');

      expect(fixture.componentInstance.value()).toEqual([{ value: 'zed@uni.dev' }]);
    });

    it('keeps a typo in the field and reports it', () => {
      const rejections: unknown[] = [];
      fixture.componentInstance.rejected.subscribe((r) => rejections.push(r));
      type('zzz');
      press('Enter');

      expect(values()).toEqual([]);
      expect(field().value).toBe('zzz');
      expect(rejections).toEqual([{ raw: 'zzz', reason: 'invalid' }]);
    });

    it('refuses unknown addresses when allowCustom is off', () => {
      setInputs({ allowCustom: false });
      type('zed@uni.dev');
      press('Enter');

      expect(values()).toEqual([]);
      expect(field().value).toBe('zed@uni.dev');
    });

    it('Backspace in an empty field removes the last person', () => {
      setInputs({ value: [CONTACTS[0], CONTACTS[1]] });
      press('Backspace');

      expect(values()).toEqual(['alice@uni.dev']);
    });

    it('emits added and removed with the contact', () => {
      const added: UniContact[] = [];
      const removed: UniContact[] = [];
      fixture.componentInstance.added.subscribe((c) => added.push(c));
      fixture.componentInstance.removed.subscribe((c) => removed.push(c));
      type('ali');
      press('ArrowDown');
      press('Enter');
      press('Backspace');

      expect(added).toEqual([CONTACTS[0]]);
      expect(removed).toEqual([CONTACTS[0]]);
    });
  });

  describe('chrome and ARIA', () => {
    it('is framed by default and bare when unframed', () => {
      expect(host.querySelector('uni-input-box')).not.toBeNull();

      setInputs({ unframed: true });
      expect(host.querySelector('uni-input-box')).toBeNull();
    });

    it('wires the combobox contract through to the inner field', () => {
      focusField();

      expect(field().getAttribute('aria-label')).toBe('To');
      expect(field().getAttribute('aria-expanded')).toBe('true');
      press('ArrowDown');
      expect(field().getAttribute('aria-activedescendant')).toBe(options()[0].id);
      expect(field().getAttribute('autocomplete')).toBe('off');
    });

    it('keeps the avatar out of the option name', () => {
      focusField();

      expect(
        options()[0].querySelector('uni-avatar')?.closest('[aria-hidden="true"]')
      ).not.toBeNull();
    });

    it('gates aria-invalid on touched or dirty', () => {
      setInputs({ invalid: true });
      expect(field().getAttribute('aria-invalid')).toBeNull();

      setInputs({ dirty: true });
      expect(field().getAttribute('aria-invalid')).toBe('true');
    });

    it('marks the field touched on blur', () => {
      let touches = 0;
      fixture.componentInstance.touch.subscribe(() => touches++);
      field().dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();

      expect(fixture.componentInstance.touched()).toBe(true);
      expect(touches).toBe(1);
    });
  });
});
