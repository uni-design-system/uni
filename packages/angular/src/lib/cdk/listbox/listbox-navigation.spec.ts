import { signal } from '@angular/core';
import { createListboxNavigation } from './listbox-navigation';

describe('ListboxNavigation', () => {
  const setup = (initialCount = 3, homeEndNavigates = false) => {
    const count = signal(initialCount);
    const nav = createListboxNavigation({
      count: () => count(),
      idPrefix: 'test',
      homeEndNavigates,
    });
    return { nav, count };
  };

  const press = (key: string) => new KeyboardEvent('keydown', { key, cancelable: true });

  it('starts closed with nothing active', () => {
    const { nav } = setup();
    expect(nav.open()).toBe(false);
    expect(nav.activeIndex()).toBe(-1);
    expect(nav.activeDescendantId()).toBeNull();
  });

  it('stays closed while there is nothing to show', () => {
    const { nav } = setup(0);
    nav.show();
    expect(nav.open()).toBe(false);
  });

  describe('navigate()', () => {
    it('opens onto the first option with ArrowDown', () => {
      const { nav } = setup();
      const event = press('ArrowDown');

      expect(nav.navigate(event)).toBe(true);
      expect(event.defaultPrevented).toBe(true);
      expect(nav.open()).toBe(true);
      expect(nav.activeIndex()).toBe(0);
    });

    it('opens onto the last option with ArrowUp, matching menu behaviour', () => {
      const { nav } = setup();
      nav.navigate(press('ArrowUp'));
      expect(nav.activeIndex()).toBe(2);
    });

    it('wraps at both ends', () => {
      const { nav } = setup();
      nav.navigate(press('ArrowDown')); // 0
      nav.navigate(press('ArrowDown')); // 1
      nav.navigate(press('ArrowDown')); // 2
      nav.navigate(press('ArrowDown'));
      expect(nav.activeIndex()).toBe(0);

      nav.navigate(press('ArrowUp'));
      expect(nav.activeIndex()).toBe(2);
    });

    it('clamps instead of wrapping when asked', () => {
      const count = signal(3);
      const nav = createListboxNavigation({ count: () => count(), wrap: false });

      nav.navigate(press('ArrowUp')); // opens on last
      nav.navigate(press('ArrowDown'));
      expect(nav.activeIndex()).toBe(2);

      nav.setActive(0);
      nav.navigate(press('ArrowUp'));
      expect(nav.activeIndex()).toBe(0);
    });

    it('leaves Home and End to the caret by default', () => {
      // APG's editable-combobox pattern: a text field keeps its editing keys.
      // Nothing is lost — ArrowUp already opens on the last option.
      const { nav } = setup();
      const home = press('Home');
      const end = press('End');

      expect(nav.navigate(end)).toBe(false);
      expect(nav.navigate(home)).toBe(false);
      expect(nav.activeIndex()).toBe(-1);
      expect(end.defaultPrevented).toBe(false);
      expect(home.defaultPrevented).toBe(false);
    });

    it('jumps to the ends with Home and End when a consumer opts in', () => {
      // uni-multi-select-dropdown: focus rides checkboxes, not a text field.
      const { nav } = setup(3, true);
      nav.navigate(press('End'));
      expect(nav.activeIndex()).toBe(2);

      nav.navigate(press('Home'));
      expect(nav.activeIndex()).toBe(0);
    });

    it('leaves other keys to the caller', () => {
      const { nav } = setup();
      const event = press('Enter');

      expect(nav.navigate(event)).toBe(false);
      expect(event.defaultPrevented).toBe(false);
    });

    it('does nothing when there are no options', () => {
      const { nav } = setup(0);
      expect(nav.navigate(press('ArrowDown'))).toBe(false);
    });
  });

  describe('aria wiring', () => {
    it('exposes the active option id only while open', () => {
      const { nav } = setup();
      nav.navigate(press('ArrowDown'));

      expect(nav.activeDescendantId()).toBe(nav.optionId(0));

      nav.hide();
      expect(nav.activeDescendantId()).toBeNull();
    });

    it('never points at an option that no longer exists', () => {
      const { nav, count } = setup(3, true);
      nav.navigate(press('End'));
      expect(nav.activeIndex()).toBe(2);

      // A narrowing filter is the common case: the active id must not dangle.
      count.set(1);
      expect(nav.activeIndex()).toBe(-1);
      expect(nav.activeDescendantId()).toBeNull();
    });

    it('gives each instance its own id namespace', () => {
      const { nav: a } = setup();
      const { nav: b } = setup();
      expect(a.listboxId).not.toBe(b.listboxId);
      expect(a.optionId(0)).not.toBe(b.optionId(0));
    });
  });

  it('hiding clears the active option so reopening starts clean', () => {
    const { nav } = setup(3, true);
    nav.navigate(press('End'));
    nav.hide();
    nav.show();

    expect(nav.activeIndex()).toBe(-1);
  });

  describe('disabled options', () => {
    // Opted in throughout: the disabled-edge walking these cases cover is
    // reachable only where Home/End navigate at all (uni-multi-select-dropdown).
    const setupDisabled = (disabled: number[], count = 5, wrap = true) => {
      const disabledSet = new Set(disabled);
      return createListboxNavigation({
        count: () => count,
        idPrefix: 'test',
        wrap,
        disabled: (index) => disabledSet.has(index),
        homeEndNavigates: true,
      });
    };

    it('steps over a disabled option with ArrowDown', () => {
      const nav = setupDisabled([1]);
      nav.navigate(press('ArrowDown')); // 0
      nav.navigate(press('ArrowDown'));
      expect(nav.activeIndex()).toBe(2);
    });

    it('wraps over disabled options at the ends', () => {
      const nav = setupDisabled([0, 4]);
      nav.navigate(press('End')); // walks inward to 3
      nav.navigate(press('ArrowDown')); // skips 4, wraps, skips 0
      expect(nav.activeIndex()).toBe(1);
    });

    it('opens with ArrowUp on the last enabled option', () => {
      const nav = setupDisabled([4]);
      nav.navigate(press('ArrowUp'));
      expect(nav.activeIndex()).toBe(3);
    });

    it('walks Home and End inward past disabled edges', () => {
      const nav = setupDisabled([0, 1, 4]);
      nav.navigate(press('Home'));
      expect(nav.activeIndex()).toBe(2);

      nav.navigate(press('End'));
      expect(nav.activeIndex()).toBe(3);
    });

    it('holds position when everything toward the clamped edge is disabled', () => {
      const nav = setupDisabled([3, 4], 5, false);
      nav.navigate(press('Home')); // 0
      nav.navigate(press('End')); // walks inward to 2
      expect(nav.activeIndex()).toBe(2);

      nav.navigate(press('ArrowDown'));
      expect(nav.activeIndex()).toBe(2);
    });

    it('never activates an all-disabled list and leaves the event unconsumed', () => {
      const nav = setupDisabled([0, 1, 2], 3);
      const event = press('ArrowDown');

      expect(nav.navigate(event)).toBe(false);
      expect(event.defaultPrevented).toBe(false);
      expect(nav.activeIndex()).toBe(-1);
    });
  });

  describe('closeOnFocusOut', () => {
    const focusEvent = (container: HTMLElement, next: Node | null) =>
      ({ relatedTarget: next, currentTarget: container }) as unknown as FocusEvent;

    it('closes when focus leaves the control', () => {
      const { nav } = setup();
      nav.show();

      nav.closeOnFocusOut(focusEvent(document.createElement('div'), document.createElement('a')));
      expect(nav.open()).toBe(false);
    });

    it('stays open while focus moves inside the control', () => {
      const { nav } = setup();
      nav.show();

      const container = document.createElement('div');
      const child = document.createElement('button');
      container.appendChild(child);

      nav.closeOnFocusOut(focusEvent(container, child));
      expect(nav.open()).toBe(true);
    });
  });
});
