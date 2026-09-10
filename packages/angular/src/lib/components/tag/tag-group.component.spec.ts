/**
 * `uni-tag-group`. What is asserted is the wiring the group exists for — which
 * chip is selected, which one holds the tab stop, and the justification filler —
 * not colours or spacing, which belong to the `tag` and `tagGroup` theme entries.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniTagGroupComponent } from './tag-group.component';
import type { UniTagGroupItem } from './tag.model';

describe('UniTagGroupComponent', () => {
  let fixture: ComponentFixture<UniTagGroupComponent<string>>;
  let host: HTMLElement;

  const ITEMS: UniTagGroupItem<string>[] = [
    { label: 'Design', value: 'design' },
    { label: 'Engineering', value: 'engineering' },
    { label: 'Legal', value: 'legal' },
  ];

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const chips = () => Array.from(host.querySelectorAll('uni-tag'));
  const bodies = () =>
    Array.from(host.querySelectorAll<HTMLButtonElement>('uni-tag button:not([uni-icon-button])'));
  const tabIndexes = () => bodies().map((button) => button.getAttribute('tabindex'));
  const pressed = () => bodies().map((button) => button.getAttribute('aria-pressed'));

  const keydown = (key: string) => {
    host.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniTagGroupComponent] }).compileComponents();
    fixture = TestBed.createComponent<UniTagGroupComponent<string>>(UniTagGroupComponent);
    host = fixture.nativeElement;
    setInputs({ items: ITEMS });
  });

  it('renders one interactive chip per item', () => {
    expect(chips()).toHaveLength(3);
    // Every chip is a toggle, so every one announces its state.
    expect(pressed()).toEqual(['false', 'false', 'false']);
  });

  describe('selection', () => {
    it('selects on activation and deselects on a second press', () => {
      bodies()[1].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toEqual(['engineering']);
      expect(pressed()).toEqual(['false', 'true', 'false']);

      bodies()[1].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toEqual([]);
    });

    it('replaces the selection when single select', () => {
      bodies()[0].click();
      bodies()[2].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.value()).toEqual(['legal']);
    });

    it('accumulates when multiple', () => {
      setInputs({ multiple: true });

      bodies()[0].click();
      bodies()[2].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.value()).toEqual(['design', 'legal']);
    });

    it('emits the activated value, whichever way the state went', () => {
      const seen: unknown[] = [];
      fixture.componentInstance.activated.subscribe((value) => seen.push(value));

      bodies()[1].click();
      bodies()[1].click();

      expect(seen).toEqual(['engineering', 'engineering']);
    });

    it('re-emits a chip removal with its value', () => {
      const seen: unknown[] = [];
      setInputs({ items: [{ label: 'Design', value: 'design', removable: true }] });
      fixture.componentInstance.removed.subscribe((value) => seen.push(value));

      host.querySelector<HTMLButtonElement>('button[uni-icon-button]')!.click();

      expect(seen).toEqual(['design']);
    });

    it('paints a selected value passed in, without a per-chip binding', () => {
      setInputs({ value: ['legal'] });
      expect(pressed()).toEqual(['false', 'false', 'true']);
    });
  });

  describe('keyboard', () => {
    it('is one tab stop for the whole row', () => {
      // Twelve filter chips should cost one Tab to pass, not twelve.
      expect(tabIndexes()).toEqual(['0', '-1', '-1']);
    });

    it('moves the tab stop with the arrow keys, both axes', () => {
      keydown('ArrowRight');
      expect(tabIndexes()).toEqual(['-1', '0', '-1']);

      // The row wraps, so Down is as natural a "next chip" as Right.
      keydown('ArrowDown');
      expect(tabIndexes()).toEqual(['-1', '-1', '0']);

      keydown('ArrowLeft');
      expect(tabIndexes()).toEqual(['-1', '0', '-1']);

      keydown('ArrowUp');
      expect(tabIndexes()).toEqual(['0', '-1', '-1']);
    });

    it('stops at both ends rather than wrapping round', () => {
      keydown('ArrowLeft');
      expect(tabIndexes()).toEqual(['0', '-1', '-1']);

      keydown('End');
      keydown('ArrowRight');
      expect(tabIndexes()).toEqual(['-1', '-1', '0']);
    });

    it('moves real focus, not just the tab stop', async () => {
      bodies()[0].focus();

      keydown('ArrowRight');
      // The tab index the chip reads is a binding, so the focus call is queued
      // behind it.
      await Promise.resolve();

      expect(document.activeElement).toBe(bodies()[1]);
    });

    it('jumps to either end with Home and End', () => {
      keydown('End');
      expect(tabIndexes()).toEqual(['-1', '-1', '0']);

      keydown('Home');
      expect(tabIndexes()).toEqual(['0', '-1', '-1']);
    });

    it('leaves the tab stop on the chip the user last picked', () => {
      bodies()[2].click();
      fixture.detectChanges();

      // Tabbing back into the group lands where they left off.
      expect(tabIndexes()).toEqual(['-1', '-1', '0']);
    });

    it('ignores navigation on an empty group', () => {
      setInputs({ items: [] });
      expect(() => keydown('ArrowRight')).not.toThrow();
    });
  });

  describe('layout', () => {
    const filler = () => host.querySelector('i[aria-hidden="true"]');

    it('announces itself as a toolbar, horizontally', () => {
      expect(host.getAttribute('role')).toBe('toolbar');
      expect(host.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('adds the justification filler only when justifying', () => {
      expect(filler()).toBeNull();

      setInputs({ layout: 'justify' });

      // It can only land on the last line, where it swallows the slack — so
      // filled rows stretch flush and the last one stays ragged.
      expect(filler()).not.toBeNull();
    });

    it('lets an item override the group-wide chip presentation', () => {
      setInputs({
        chipTone: 'outline',
        items: [ITEMS[0], { label: 'Legal', value: 'legal', tone: 'solid' }],
      });

      expect(chips()[0].className).toContain('tone-outline');
      expect(chips()[1].className).toContain('tone-solid');
    });
  });
});
