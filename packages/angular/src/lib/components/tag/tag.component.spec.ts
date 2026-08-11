/**
 * Characterization specs for `uni-tag` v1, written ahead of the v2 rewrite
 * (`packages/angular/prototypes/tag-input/SPEC.md`). The component shipped with
 * no coverage at all, so these pin down what it *actually does today* — the
 * contract v2 must keep, and, separately, the defects v2 is meant to fix.
 *
 * Deliberately not asserted: colors, radii and spacing. They are welded into
 * the template today and v2 moves them behind a `tag` theme entry, so pinning
 * them would only manufacture failures the rewrite has to delete. Structure is
 * asserted just firmly enough to notice if a part disappears.
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

  /** Emissions of the `close` output, in order. */
  const closeEmissions = () => {
    const seen: (string | number)[] = [];
    fixture.componentInstance.close.subscribe((v) => seen.push(v));
    return seen;
  };

  const removeButton = () => host.querySelector('button')!;

  /**
   * What a screen reader announces: text content minus `aria-hidden` parts.
   * The icon ligature (`uni-symbol` renders the literal text "close") sits
   * inside the button and must stay out of the announced name.
   */
  const accessibleName = (el: HTMLElement) => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
    return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
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

  describe('contract v2 should preserve', () => {
    it('renders the label', () => {
      setInputs({ label: 'Design', value: 'design' });
      expect(host.textContent).toContain('Design');
    });

    it('offers a remove control with an accessible name naming the tag', () => {
      setInputs({ label: 'Design', value: 'design' });
      const button = removeButton();

      expect(button).not.toBeNull();
      // uni-icon-button renders projected text into a visually hidden span,
      // so the icon-only control is still announced — and the decorative
      // ligature is excluded because uni-symbol is aria-hidden.
      expect(accessibleName(button)).toBe('Remove Design');
    });

    it('emits the value when the remove control is clicked', () => {
      const emitted = closeEmissions();
      setInputs({ label: 'Design', value: 'design' });

      removeButton().click();

      expect(emitted).toEqual(['design']);
    });

    it('emits numbers as numbers, not stringified', () => {
      const emitted = closeEmissions();
      setInputs({ label: 'Answer', value: 42 });

      removeButton().click();

      expect(emitted).toEqual([42]);
      expect(typeof emitted[0]).toBe('number');
    });

    it('emits once per click', () => {
      const emitted = closeEmissions();
      setInputs({ label: 'Design', value: 'design' });

      removeButton().click();
      removeButton().click();

      expect(emitted).toEqual(['design', 'design']);
    });
  });

  /**
   * Behaviour that is wrong today and that the v2 rewrite is expected to
   * change. These exist so the rewrite is a deliberate decision rather than an
   * accident: when v2 lands, each of these should fail and be rewritten as the
   * corrected expectation.
   */
  describe('known v1 defects (SPEC.md "What is wrong with v1")', () => {
    it('DEFECT: a falsy value cannot be removed — the guard drops the emission', () => {
      const emitted = closeEmissions();

      setInputs({ label: 'Empty string', value: '' });
      removeButton().click();

      setInputs({ label: 'Zero', value: 0 });
      removeButton().click();

      // `handleClose` guards with `if (v)`, so a tag keyed by '' or 0 is
      // undeletable. v2 must emit for any defined value.
      expect(emitted).toEqual([]);
    });

    it('DEFECT: the remove button is unconditional, so display-only tags ship a dead control', () => {
      // The docs call tags "display-only chips", yet every tag puts a
      // "Remove …" button in the a11y tree — and with no value it cannot even
      // do anything. v2 makes removal opt-in; not emitting without a value is
      // the one correct half of this behaviour and should survive.
      const emitted = closeEmissions();
      setInputs({ label: 'Category' });

      expect(removeButton()).not.toBeNull();
      removeButton().click();
      expect(emitted).toEqual([]);
    });

    it('DEFECT: with no label the remove button is announced as a dangling "Remove"', () => {
      setInputs({ value: 'x' });
      expect(accessibleName(removeButton())).toBe('Remove');
    });
  });
});
