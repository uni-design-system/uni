/**
 * `uni-tag` v2. Grew out of the v1 characterization specs: each `DEFECT:` case
 * there is now a corrected expectation here, marked FIXED so the migration is
 * traceable.
 *
 * Deliberately not asserted: exact colours and spacing. They live in the `tag`
 * theme entry, so pinning them here would test the theme rather than the
 * component. The tone/variant *wiring* is asserted instead — that the host
 * carries the class the theme's nested `&.tone-*` rules key on.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniTagComponent } from './tag.component';

describe('UniTagComponent', () => {
  let fixture: ComponentFixture<UniTagComponent>;
  let host: HTMLElement;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const removeButton = () => host.querySelector<HTMLButtonElement>('button[uni-icon-button]');
  const bodyButton = () => host.querySelector<HTMLButtonElement>('button:not([uni-icon-button])');

  /**
   * What a screen reader announces: text content minus `aria-hidden` parts.
   * The icon ligature (`uni-symbol` renders the literal text "close") sits
   * inside the button and must stay out of the announced name — and v2's lead
   * slot adds avatars and dots that must stay out of it too.
   */
  const accessibleName = (el: Element) => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
    return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
  };

  const emissions = (output: 'removed' | 'activated') => {
    const seen: unknown[] = [];
    fixture.componentInstance[output].subscribe((v) => seen.push(v));
    return seen;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniTagComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniTagComponent);
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('as a static chip', () => {
    it('renders the label as plain text, with no widget semantics', () => {
      setInputs({ label: 'Design' });

      expect(host.textContent).toContain('Design');
      // A static tag is content, not a control: no role, no tab stop.
      expect(host.getAttribute('role')).toBeNull();
      expect(host.getAttribute('tabindex')).toBeNull();
      expect(bodyButton()).toBeNull();
    });

    it('FIXED: ships no remove control unless asked — removal is opt-in', () => {
      setInputs({ label: 'Category' });
      expect(removeButton()).toBeNull();
    });

    it('carries the tone class the theme keys its nested rules on', () => {
      setInputs({ label: 'Design' });
      expect(host.className).toContain('tone-soft');

      setInputs({ tone: 'outline' });
      expect(host.className).toContain('tone-outline');
      expect(host.className).not.toContain('tone-soft');
    });
  });

  describe('removal', () => {
    beforeEach(() => setInputs({ label: 'Design', value: 'design', removable: true }));

    it('names the remove control after the tag', () => {
      expect(accessibleName(removeButton()!)).toBe('Remove Design');
    });

    it('lets removeLabel override the accessible name', () => {
      setInputs({ removeLabel: 'Dismiss the design filter' });
      expect(accessibleName(removeButton()!)).toBe('Dismiss the design filter');
    });

    it('emits the value on click', () => {
      const removed = emissions('removed');
      removeButton()!.click();
      expect(removed).toEqual(['design']);
    });

    it('emits numbers as numbers, not stringified', () => {
      const removed = emissions('removed');
      setInputs({ value: 42 });

      removeButton()!.click();

      expect(removed).toEqual([42]);
      expect(typeof removed[0]).toBe('number');
    });

    it('FIXED: a falsy value is removable — v1 dropped these emissions', () => {
      const removed = emissions('removed');

      setInputs({ value: '' });
      removeButton()!.click();

      setInputs({ value: 0 });
      removeButton()!.click();

      expect(removed).toEqual(['', 0]);
    });

    it('still emits (as undefined) when the tag carries no value', () => {
      const removed = emissions('removed');
      setInputs({ value: undefined });

      removeButton()!.click();

      expect(removed).toEqual([undefined]);
    });
  });

  describe('as an interactive chip', () => {
    beforeEach(() => setInputs({ label: 'Design', value: 'design', interactive: true }));

    it('makes the body a real button carrying the pressed state', () => {
      const body = bodyButton();
      expect(body).not.toBeNull();
      expect(body!.getAttribute('type')).toBe('button');
      expect(body!.getAttribute('aria-pressed')).toBe('false');

      setInputs({ selected: true });
      expect(bodyButton()!.getAttribute('aria-pressed')).toBe('true');
    });

    it('emits activated with the value', () => {
      const activated = emissions('activated');
      bodyButton()!.click();
      expect(activated).toEqual(['design']);
    });

    it('keeps the remove control a sibling, never nested inside the body', () => {
      setInputs({ removable: true });

      // Nesting would be invalid HTML and would make the inner control
      // unreachable for keyboard users.
      expect(bodyButton()!.querySelector('button')).toBeNull();
      expect(removeButton()!.closest('button')).toBe(removeButton());
    });
  });

  describe('when disabled', () => {
    beforeEach(() =>
      setInputs({ label: 'Locked', value: 'locked', removable: true, interactive: true, disabled: true })
    );

    it('disables both controls', () => {
      expect(bodyButton()!.disabled).toBe(true);
      expect(removeButton()!.disabled).toBe(true);
    });

    it('emits nothing even if a click is dispatched', () => {
      const removed = emissions('removed');
      const activated = emissions('activated');

      removeButton()!.click();
      bodyButton()!.click();

      expect(removed).toEqual([]);
      expect(activated).toEqual([]);
    });
  });

  describe('invalid state', () => {
    it('exposes aria-invalid and does not rely on colour alone', () => {
      setInputs({ label: 'nope@@x' });
      const restingClass = host.className;

      setInputs({ invalid: true });

      expect(host.getAttribute('aria-invalid')).toBe('true');
      // Styling actually changes — not just the ARIA attribute.
      expect(host.className).not.toBe(restingClass);
      // WCAG 1.4.1: the dashed underline carries "malformed" without colour.
      const allStyles = Array.from(document.querySelectorAll('style'))
        .map((style) => style.textContent ?? '')
        .join('');
      expect(allStyles).toContain('underline dashed');
    });

    it('is absent by default', () => {
      setInputs({ label: 'fine' });
      expect(host.getAttribute('aria-invalid')).toBeNull();
    });
  });

  describe('lead slot', () => {
    it('renders an avatar image when given a source', () => {
      setInputs({ label: 'Alice Chen', avatarSrc: 'alice.png' });
      const img = host.querySelector('img');

      expect(img?.getAttribute('src')).toBe('alice.png');
      // Decorative: the chip's own text is the accessible name.
      expect(img?.getAttribute('alt')).toBe('');
      expect(accessibleName(host)).toBe('Alice Chen');
    });

    it('falls back to initials from avatarName', () => {
      setInputs({ label: 'Alice Chen', avatarName: 'Alice Chen' });

      expect(host.textContent).toContain('AC');
      // Initials are decorative too — they must not pollute the name.
      expect(accessibleName(host)).toBe('Alice Chen');
    });

    it('shows the selected symbol ahead of other lead content', () => {
      setInputs({ label: 'Design', avatarName: 'Alice Chen', selected: true });
      expect(host.textContent).toContain('check');
    });

    it('renders a status dot without announcing it', () => {
      setInputs({ label: 'Live', dot: true });
      expect(accessibleName(host)).toBe('Live');
    });
  });
});
