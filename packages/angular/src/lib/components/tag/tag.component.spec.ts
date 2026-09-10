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
import { emittedRuleFor } from '../../../testing/emitted-css';
import { ThemeService } from '../../theming';
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

  /**
   * The lead icon's resolved `name` input. A signal input never reflects to
   * the DOM, so read it off the component instance.
   */
  const leadIconName = (): string | undefined =>
    fixture.debugElement
      .query((de) => (de.nativeElement as HTMLElement)?.tagName === 'UNI-ICON')
      ?.componentInstance.name();

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

    it('makes the body a real button', () => {
      const body = bodyButton();
      expect(body).not.toBeNull();
      expect(body!.getAttribute('type')).toBe('button');
    });

    it('carries aria-pressed only when it is actually a toggle', () => {
      // An interactive chip is not always a toggle — inside a tag input it is
      // focusable so it can be removed. Announcing "not pressed" there is
      // worse than announcing nothing.
      expect(bodyButton()!.getAttribute('aria-pressed')).toBeNull();

      setInputs({ selected: false });
      expect(bodyButton()!.getAttribute('aria-pressed')).toBe('false');

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

    it('shows the selected icon ahead of other lead content', () => {
      setInputs({ label: 'Design', avatarName: 'Alice Chen', selected: true });

      expect(leadIconName()).toBe('check');
      expect(host.textContent).not.toContain('AC');
    });

    it('renders a theme icon via iconName', () => {
      setInputs({ label: 'Starred', iconName: 'star' });
      expect(leadIconName()).toBe('star');
    });

    it('keeps glyphs out of the text content entirely', () => {
      setInputs({ label: 'Design', iconName: 'star', removable: true });

      // Icon primitives are CSS masks, so unlike a Material ligature they
      // contribute no text — the accessible name needs no aria-hidden rescue.
      expect(host.textContent).not.toContain('star');
      expect(host.textContent).not.toContain('close');
      expect(accessibleName(removeButton()!)).toBe('Remove Design');
    });

    it('renders a status dot without announcing it', () => {
      setInputs({ label: 'Live', dot: true });
      expect(accessibleName(host)).toBe('Live');
    });
  });

  /**
   * State classes, not colours: what the theme paints lives in its `tag`
   * variants, and the component's job is to put the hook on the host for the
   * nested `&.tag-selected` / `&.tag-interactive:hover` rules to key on — the
   * same contract `tone-*` already is.
   */
  describe('state classes the theme keys its rules on', () => {
    it('marks an interactive chip, so hover can be themed', () => {
      setInputs({ label: 'Design' });
      expect(host.className).not.toContain('tag-interactive');

      setInputs({ interactive: true });
      expect(host.className).toContain('tag-interactive');
    });

    it('marks a selected chip, so selection paints without an app binding', () => {
      setInputs({ label: 'Design', interactive: true, selected: false });
      expect(host.className).not.toContain('tag-selected');

      setInputs({ selected: true });
      expect(host.className).toContain('tag-selected');
    });

    it('animates the edge and the wash, not just the fill', () => {
      setInputs({ label: 'Design' });
      const rule = emittedRuleFor(host);

      // The outline tone changes only `border-color`, which used to snap while
      // the fill faded; `filter` carries the theme's hover and selected washes.
      expect(rule).toContain('border-color');
      expect(rule).toContain('filter');
      // Scoped, never `all`: `all` would animate the reserved slot and, inside
      // a justified group, the chip's width.
      expect(rule).not.toContain('transition:all');
    });
  });

  /**
   * Geometry. The numbers themselves come from the theme's `tag` sizes, so what
   * is asserted is the arithmetic between them: that the ends tuck and that
   * whatever sits on one side of the label is matched on the other.
   */
  describe('tucked ends and a centred label', () => {
    /**
     * The host's own rule, with the nested ones dropped. The projected-lead
     * balance is a `:has()` rule carrying the same properties, so a match
     * against the whole emitted text would read as a plain chip having padding
     * it does not have.
     */
    const baseRule = (element: Element): string =>
      emittedRuleFor(element)
        .split('}')
        .filter((chunk) => /^\.css-[\w-]+\{/.test(chunk))
        .join('}');

    const padding = (): { start: number; end: number } => {
      const rule = baseRule(host);
      const start = /padding-inline-start:(\d+)px/.exec(rule);
      const end = /padding-inline-end:(\d+)px/.exec(rule);
      return { start: Number(start?.[1] ?? NaN), end: Number(end?.[1] ?? NaN) };
    };

    it('leaves a plain label on the size token\u2019s own gutter', () => {
      setInputs({ label: 'Design' });

      // Nothing to balance, so the chip states no longhand at all.
      const { start, end } = padding();
      expect(start).toBeNaN();
      expect(end).toBeNaN();
    });

    it('tucks a lead into the rounded end and balances the far side', () => {
      setInputs({ label: 'Starred', iconName: 'star' });
      const { start, end } = padding();

      // The lead box is inset 3px vertically (height - 6), so the same inset
      // horizontally sits it concentric with the cap.
      expect(start).toBe(3);
      // Balanced: inset + lead + gap on the label's left, the same on its right.
      expect(end).toBeGreaterThan(start);
    });

    it('tucks both ends when the chip also removes', () => {
      setInputs({ label: 'Starred', iconName: 'star', removable: true });
      const { start, end } = padding();

      // A lead one side and the remove control the other is symmetric already.
      expect(start).toBe(3);
      expect(end).toBe(3);
    });

    it('gives a status dot its own inset, not a lead box\u2019s', () => {
      setInputs({ label: 'Live', dot: true });
      const { start, end } = padding();

      // A 6px dot pushed 3px into the curve reads as a smudge on the edge, so
      // it sits concentric with the cap like everything else: (24 - 6) / 2.
      expect(start).toBe(9);
      // And the balance follows the dot's width, not the lead box's.
      expect(end).toBe(start + 6 + 4);
    });

    it('tucks a remove-only chip without padding the far side to match', () => {
      setInputs({ label: 'Design', removable: true });
      const { start, end } = padding();

      // The glyph tucks into the trailing curve...
      expect(end).toBe(3);
      // ...but a remove control is an affordance, not content, so the label
      // keeps the size token's gutter rather than sitting behind a stretch of
      // empty chip. Only a lead is balanced against.
      expect(start).toBe(10);
    });

    it('keeps the gutter when the end is too square to tuck into', () => {
      // The theme's documented escape to rectangular labels. A glyph jammed
      // against a corner is worse than one in a gutter.
      const theme = TestBed.inject(ThemeService);
      const active = theme.theme();
      theme.setTheme({
        ...active,
        components: {
          ...active.components,
          tag: {
            ...active.components['tag'],
            options: { ...active.components['tag']?.options, borderRadius: 'none' },
          },
        },
      });
      setInputs({ label: 'Starred', iconName: 'star' });

      expect(padding().start).toBeGreaterThan(3);
    });
  });

  describe('as a toggle chip', () => {
    const leadSlot = () => host.querySelector('span[aria-hidden="true"]');

    it('holds the check\u2019s place while unselected, so the row never reflows', () => {
      setInputs({ label: 'Design', interactive: true, selected: false });
      const unselected = emittedRuleFor(host);

      expect(leadSlot()).not.toBeNull();
      expect(leadIconName()).toBeUndefined();

      setInputs({ selected: true });

      // Same footprint, one glyph more: picking a chip must not resize it.
      expect(leadIconName()).toBe('check');
      const reserved = /padding-inline-start:\d+px/.exec(unselected)?.[0];
      expect(reserved).toBe('padding-inline-start:3px');
      expect(emittedRuleFor(host)).toContain(reserved!);
    });

    it('reserves nothing when another lead already holds the place', () => {
      // The check replaces an avatar at identical width, so there is no slot to
      // hold open and no dead space to pay for.
      setInputs({ label: 'Alice Chen', avatarName: 'Alice Chen', selected: false });
      expect(host.textContent).toContain('AC');
    });

    it('reserves nothing on a chip that is not a toggle', () => {
      setInputs({ label: 'Design', interactive: true });
      expect(leadSlot()).toBeNull();
    });
  });
});
