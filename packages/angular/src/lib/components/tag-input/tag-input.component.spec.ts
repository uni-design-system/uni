/**
 * Behaviours ported from the vanilla prototype's Playwright suite
 * (`packages/angular/prototypes/tag-input/test.mjs`), which asserted them
 * against the design before it was committed to Angular.
 *
 * Focus moves happen in a microtask (the chip has to exist before it can be
 * focused), so tests that assert focus await `flush()`.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniTagInputComponent } from './tag-input.component';
import type { UniTagItem } from './tag-input.model';

describe('UniTagInputComponent', () => {
  let fixture: ComponentFixture<UniTagInputComponent>;
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

  const field = () => host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  const chips = () => Array.from(host.querySelectorAll('uni-tag'));
  const chipLabels = () => chips().map((c) => (c.textContent ?? '').replace(/Remove.*/, '').trim());
  const options = () => Array.from(host.querySelectorAll<HTMLElement>('[role="option"]'));
  const values = () => fixture.componentInstance.value().map((i) => i.value);

  /** Type into the field the way a user does, then fire the key. */
  const type = (text: string) => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const press = (key: string, target: EventTarget = field()) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniTagInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniTagInputComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('label', 'To');
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('committing', () => {
    it('commits typed text on Enter', () => {
      type('alpha');
      press('Enter');

      expect(values()).toEqual(['alpha']);
      expect(field().value).toBe('');
    });

    it('commits on each configured separator', () => {
      type('alpha');
      press(',');
      type('beta');
      press(';');

      expect(values()).toEqual(['alpha', 'beta']);
    });

    it('treats Space as a separator only for the email preset', () => {
      type('hello');
      press(' ');
      expect(values()).toEqual([]);

      setInputs({ preset: 'email' });
      type('a@b.com');
      press(' ');
      expect(values()).toEqual(['a@b.com']);
    });

    it('commits on blur when asked, and marks the field touched', () => {
      type('alpha');
      field().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(values()).toEqual(['alpha']);
      expect(fixture.componentInstance.touched()).toBe(true);
    });

    it('commits on Tab without trapping focus', () => {
      type('alpha');
      const event = press('Tab');

      expect(values()).toEqual(['alpha']);
      // Tab must stay un-prevented or the field becomes a keyboard trap.
      expect(event.defaultPrevented).toBe(false);
    });

    it('ignores empty and whitespace-only input', () => {
      type('   ');
      press('Enter');
      expect(values()).toEqual([]);
    });

    it('emits added with the committed item', () => {
      const added: UniTagItem[] = [];
      fixture.componentInstance.added.subscribe((item) => added.push(item));

      type('alpha');
      press('Enter');

      expect(added).toEqual([{ value: 'alpha' }]);
    });
  });

  describe('rejection', () => {
    it('refuses duplicates with a reason, keeping the original', () => {
      const rejections: unknown[] = [];
      fixture.componentInstance.rejected.subscribe((r) => rejections.push(r));

      type('alpha');
      press('Enter');
      type('alpha');
      press('Enter');

      expect(values()).toEqual(['alpha']);
      expect(rejections).toEqual([{ raw: 'alpha', reason: 'duplicate' }]);
    });

    it('allows duplicates when configured', () => {
      setInputs({ allowDuplicates: true });
      type('alpha');
      press('Enter');
      type('alpha');
      press('Enter');

      expect(values()).toEqual(['alpha', 'alpha']);
    });

    it('refuses entries past max', () => {
      const rejections: unknown[] = [];
      fixture.componentInstance.rejected.subscribe((r) => rejections.push(r));
      setInputs({ max: 1 });

      type('alpha');
      press('Enter');
      type('beta');
      press('Enter');

      expect(values()).toEqual(['alpha']);
      expect(rejections).toEqual([{ raw: 'beta', reason: 'max' }]);
    });

    it('keeps a malformed entry as an invalid chip rather than dropping it', () => {
      setInputs({ preset: 'email' });
      type('nope@@x');
      press('Enter');

      // A field that silently swallows a typo is worse than one showing it.
      expect(fixture.componentInstance.value()).toEqual([{ value: 'nope@@x', invalid: true }]);
    });

    it('accepts a well-formed address under the email preset', () => {
      setInputs({ preset: 'email' });
      type('a@b.com');
      press('Enter');

      expect(fixture.componentInstance.value()).toEqual([{ value: 'a@b.com' }]);
    });

    it('honours a custom validate function', () => {
      setInputs({ validate: (raw: string) => raw.startsWith('ok') });
      type('nope');
      press('Enter');

      expect(fixture.componentInstance.value()[0].invalid).toBe(true);
    });
  });

  describe('paste', () => {
    const paste = (text: string) => {
      const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
      Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
      field().dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };

    it('commits every complete token and leaves the unterminated tail typed', () => {
      setInputs({ preset: 'email' });
      paste('a@b.com, c@d.com; partial');

      expect(values()).toEqual(['a@b.com', 'c@d.com']);
      // The tail has no separator after it — the user is still typing it.
      expect(field().value).toBe('partial');
    });

    it('unwraps "Name <address>" into label and value', () => {
      setInputs({ preset: 'email' });
      paste('Priya Raman <priya@uni.dev>,');

      expect(fixture.componentInstance.value()).toEqual([
        { value: 'priya@uni.dev', label: 'Priya Raman' },
      ]);
    });

    it('flags a malformed token in a paste without losing the good ones', () => {
      setInputs({ preset: 'email' });
      paste('a@b.com, nope@@x,');

      expect(values()).toEqual(['a@b.com', 'nope@@x']);
      expect(fixture.componentInstance.value()[1].invalid).toBe(true);
    });

    it('honours a custom parse function, committing every token it returns', () => {
      // With a custom parse the app owns tokenization, so there is no
      // "still being typed" tail to guess at.
      setInputs({ parse: (raw: string) => raw.split('|') });
      paste('a|b|c');

      expect(values()).toEqual(['a', 'b', 'c']);
      expect(field().value).toBe('');
    });
  });

  describe('suggestions', () => {
    beforeEach(() =>
      setInputs({
        suggestions: [
          { value: 'a@uni.dev', label: 'Alice' },
          { value: 'b@uni.dev', label: 'Bob' },
        ],
      })
    );

    it('opens a listbox as the user types and wires the ARIA contract', () => {
      expect(field().getAttribute('aria-expanded')).toBe('false');

      type('a');

      expect(field().getAttribute('aria-expanded')).toBe('true');
      expect(field().getAttribute('aria-controls')).toBeTruthy();
      expect(options()).toHaveLength(2);
    });

    it('moves the active option with arrows and reports it as activedescendant', () => {
      type('a');
      press('ArrowDown');

      expect(field().getAttribute('aria-activedescendant')).toBe(options()[0].id);

      press('ArrowDown');
      expect(field().getAttribute('aria-activedescendant')).toBe(options()[1].id);
    });

    it('commits the highlighted suggestion on Enter, enriching the label', () => {
      type('a');
      press('ArrowDown');
      press('Enter');

      expect(fixture.componentInstance.value()).toEqual([{ value: 'a@uni.dev', label: 'Alice' }]);
    });

    it('commits the typed text when no suggestion is highlighted', () => {
      type('zzz');
      press('Enter');
      expect(values()).toEqual(['zzz']);
    });

    it('hides suggestions already committed', () => {
      type('a');
      press('ArrowDown');
      press('Enter');
      type('a');

      expect(options()).toHaveLength(1);
    });

    it('Escape closes the list first, then clears the draft', () => {
      type('a');
      expect(options()).toHaveLength(2);

      press('Escape');
      expect(options()).toHaveLength(0);
      expect(field().value).toBe('a');

      press('Escape');
      expect(field().value).toBe('');
    });

    it('emits a debounced query for the app to filter on', async () => {
      const queries: string[] = [];
      fixture.componentInstance.query.subscribe((q) => queries.push(q));
      setInputs({ debounceTime: 1 });

      type('ali');
      expect(queries).toEqual([]);

      await new Promise((resolve) => setTimeout(resolve, 5));
      expect(queries).toEqual(['ali']);
    });
  });

  describe('chip keyboard navigation', () => {
    const chipButton = (index: number) =>
      chips()[index].querySelector<HTMLButtonElement>('button:not([uni-icon-button])')!;

    beforeEach(() => {
      setInputs({ value: [{ value: 'alpha' }, { value: 'beta' }, { value: 'gamma' }] });
    });

    it('Backspace on an empty field focuses the last chip instead of deleting it', async () => {
      press('Backspace');
      await flush();

      expect(values()).toEqual(['alpha', 'beta', 'gamma']);
      expect(document.activeElement).toBe(chipButton(2));
    });

    it('a second Backspace, now on the chip, removes it and moves focus left', async () => {
      press('Backspace');
      await flush();
      press('Backspace', document.activeElement!);
      await flush();

      expect(values()).toEqual(['alpha', 'beta']);
      expect(document.activeElement).toBe(chipButton(1));
    });

    it('Delete removes and moves focus right', async () => {
      press('Backspace');
      await flush();
      press('Home', document.activeElement!);
      await flush();

      press('Delete', document.activeElement!);
      await flush();

      expect(values()).toEqual(['beta', 'gamma']);
      expect(document.activeElement).toBe(chipButton(0));
    });

    it('ArrowLeft at caret 0 enters the chips; ArrowRight past the last returns to the input', async () => {
      field().setSelectionRange(0, 0);
      press('ArrowLeft');
      await flush();
      expect(document.activeElement).toBe(chipButton(2));

      press('ArrowRight', document.activeElement!);
      await flush();
      expect(document.activeElement).toBe(field());
    });

    it('Home and End jump to the first and last chip', async () => {
      press('Backspace');
      await flush();

      press('Home', document.activeElement!);
      await flush();
      expect(document.activeElement).toBe(chipButton(0));

      press('End', document.activeElement!);
      await flush();
      expect(document.activeElement).toBe(chipButton(2));
    });

    it('Enter lifts a chip back into the input for correction', async () => {
      setInputs({ value: [{ value: 'a@b.com', label: 'Alice' }] });
      press('Backspace');
      await flush();

      press('Enter', document.activeElement!);
      await flush();

      expect(values()).toEqual([]);
      expect(field().value).toBe('Alice <a@b.com>');
    });

    it('a printable key returns to the input and starts typing', async () => {
      press('Backspace');
      await flush();

      press('x', document.activeElement!);
      await flush();

      expect(document.activeElement).toBe(field());
      expect(field().value).toBe('x');
    });

    it('Escape returns focus to the input without removing anything', async () => {
      press('Backspace');
      await flush();

      press('Escape', document.activeElement!);
      await flush();

      expect(values()).toEqual(['alpha', 'beta', 'gamma']);
      expect(document.activeElement).toBe(field());
    });
  });

  describe('chips', () => {
    it('renders one chip per value, labelled from label ?? value', () => {
      setInputs({ value: [{ value: 'a@b.com', label: 'Alice' }, { value: 'plain' }] });
      expect(chipLabels()).toEqual(['Alice', 'plain']);
    });

    it('a disabled chip ships no remove control', () => {
      setInputs({ value: [{ value: 'owner', disabled: true }, { value: 'other' }] });

      expect(chips()[0].querySelector('button[uni-icon-button]')).toBeNull();
      expect(chips()[1].querySelector('button[uni-icon-button]')).not.toBeNull();
    });

    it('clicking the remove control drops that chip and emits', () => {
      const removed: UniTagItem[] = [];
      fixture.componentInstance.removed.subscribe((item) => removed.push(item));
      setInputs({ value: [{ value: 'alpha' }, { value: 'beta' }] });

      chips()[0].querySelector<HTMLButtonElement>('button[uni-icon-button]')!.click();
      fixture.detectChanges();

      expect(values()).toEqual(['beta']);
      expect(removed).toEqual([{ value: 'alpha' }]);
    });

    it('renders an invalid entry in the warn tone', () => {
      setInputs({ value: [{ value: 'nope@@x', invalid: true }] });
      expect(chips()[0].getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('accessibility', () => {
    it('names the field and describes the removal route once, not per chip', () => {
      setInputs({ value: [{ value: 'alpha' }, { value: 'beta' }] });

      expect(field().getAttribute('aria-label')).toBe('To');
      const describedBy = field().getAttribute('aria-describedby')!;
      expect(host.querySelectorAll(`#${describedBy}`)).toHaveLength(1);
      expect(host.querySelector(`#${describedBy}`)?.textContent).toContain('Backspace');
    });

    it('announces adds and removes through a live region', () => {
      const status = () => host.querySelector('[role="status"]')?.textContent?.trim();

      type('alpha');
      press('Enter');
      expect(status()).toBe('alpha added. 1 item.');

      type('beta');
      press('Enter');
      expect(status()).toBe('beta added. 2 items.');

      chips()[0].querySelector<HTMLButtonElement>('button[uni-icon-button]')!.click();
      fixture.detectChanges();
      expect(status()).toBe('alpha removed. 1 item.');
    });

    it('announces rejections, which are otherwise only a visual pulse', () => {
      type('alpha');
      press('Enter');
      type('alpha');
      press('Enter');

      expect(host.querySelector('[role="status"]')?.textContent).toContain('already added');
    });

    it('gates aria-invalid on touched or dirty, per the form-control rule', () => {
      setInputs({ invalid: true });
      expect(field().getAttribute('aria-invalid')).toBeNull();

      setInputs({ touched: true });
      expect(field().getAttribute('aria-invalid')).toBe('true');
    });

    it('keeps the whole field to a single tab stop', () => {
      setInputs({ value: [{ value: 'alpha' }, { value: 'beta' }] });

      const tabbable = Array.from(host.querySelectorAll<HTMLElement>('input, button')).filter(
        (el) => el.tabIndex >= 0
      );
      expect(tabbable).toEqual([field()]);
    });
  });
});
