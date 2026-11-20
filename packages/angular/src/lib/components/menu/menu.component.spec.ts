import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniMenuComponent } from './menu.component';
import { MenuItem } from './menu-item/menu-item.model';
import { ThemeService } from '../../theming';

/** Joined text of every emotion style tag that mentions the given class. */
const stylesFor = (className: string) =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .filter((text) => text.includes(`.${className}`))
    .join('');

describe('UniMenuComponent', () => {
  let fixture: ComponentFixture<UniMenuComponent>;

  const items: MenuItem[] = [{ label: 'Alpha' }, { label: 'Beta' }, { label: 'Gamma' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniMenuComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniMenuComponent);
    fixture.componentRef.setInput('menuItems', items);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders an ARIA menu with menuitem children out of the tab order', () => {
    const host: HTMLElement = fixture.nativeElement;
    const menu = host.querySelector('[role="menu"]');
    expect(menu).not.toBeNull();

    const menuItems = host.querySelectorAll('[role="menuitem"]');
    expect(menuItems.length).toBe(items.length);
    menuItems.forEach((item) => expect(item.getAttribute('tabindex')).toBe('-1'));
  });

  it('emits menuItemClicked and closes when an item is activated', () => {
    let clicked: MenuItem | undefined;
    fixture.componentInstance.menuItemClicked.subscribe((item) => (clicked = item));

    const first = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[role="menuitem"]'
    );
    first!.click();

    expect(clicked).toEqual(items[0]);
  });

  it('reuses DOM nodes when the items array is rebuilt with equal content', () => {
    const host: HTMLElement = fixture.nativeElement;
    const before = Array.from(host.querySelectorAll('[role="menuitem"]'));

    fixture.componentRef.setInput(
      'menuItems',
      items.map((item) => ({ ...item }))
    );
    fixture.detectChanges();

    const after = Array.from(host.querySelectorAll('[role="menuitem"]'));
    expect(after.length).toBe(before.length);
    after.forEach((el, i) => expect(el).toBe(before[i]));
  });

  it('marks the active item with the theme activeIcon', () => {
    fixture.componentRef.setInput('activeItem', items[1]);
    fixture.detectChanges();

    const menuItems = (fixture.nativeElement as HTMLElement).querySelectorAll('[role="menuitem"]');
    // The tick is a theme icon token now, so it is an element rather than the
    // ligature text `uni-symbol` used to render.
    expect(menuItems[1].querySelector('uni-icon')).not.toBeNull();
    expect(menuItems[0].querySelector('uni-icon')).toBeNull();
  });

  describe('dividers, tones, and disabled items', () => {
    const richItems: MenuItem[] = [
      { label: 'Alpha' },
      { divider: true },
      { label: 'Beta', disabled: true },
      { label: 'Delete', variant: 'warn' },
    ];

    beforeEach(() => {
      fixture.componentRef.setInput('menuItems', richItems);
      fixture.detectChanges();
    });

    it('renders dividers as separators, not menu items', () => {
      const host: HTMLElement = fixture.nativeElement;
      expect(host.querySelectorAll('[role="separator"]').length).toBe(1);
      expect(host.querySelectorAll('[role="menuitem"]').length).toBe(3);
    });

    it('marks disabled items and skips them with arrow navigation', () => {
      document.body.appendChild(fixture.nativeElement);
      const menuItems = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="menuitem"]'
      );
      expect(menuItems[1].getAttribute('aria-disabled')).toBe('true');

      fixture.componentInstance.onOpened();
      expect(document.activeElement).toBe(menuItems[0]);

      menuItems[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(document.activeElement).toBe(menuItems[2]);
      (fixture.nativeElement as HTMLElement).remove();
    });

    it('styles warn-variant items with the theme tone', () => {
      const warnColor = TestBed.inject(ThemeService).colors()['warn'];
      const menuItems = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="menuitem"]'
      );
      const [alpha, , warn] = Array.from(menuItems);

      expect(warn.className).not.toBe(alpha.className);
      expect(stylesFor(warn.className)).toContain(warnColor);
    });
  });

  it('passes a labeled item\'s description through and keeps typeahead on the label', () => {
    fixture.componentRef.setInput('menuItems', [
      { label: 'Freight', description: 'Carrier charges' },
      { label: 'Tariff', description: 'Customs duty' },
    ]);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);

    const menuItems = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
      '[role="menuitem"]'
    );
    expect(menuItems[1].querySelector('[data-part="description"]')?.textContent?.trim()).toBe(
      'Customs duty'
    );

    menuItems[0].focus();
    // "c" starts both descriptions and neither label.
    menuItems[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'c', bubbles: true }));
    expect(document.activeElement).toBe(menuItems[0]);
    menuItems[0].dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true }));
    expect(document.activeElement).toBe(menuItems[1]);
    (fixture.nativeElement as HTMLElement).remove();
  });

  describe('group headings', () => {
    const grouped: MenuItem[] = [
      { heading: 'Fruit' },
      { label: 'Apple' },
      { label: 'Banana' },
      { divider: true },
      { heading: 'Greens' },
      { label: 'Fennel' },
    ];

    const host = () => fixture.nativeElement as HTMLElement;
    const menuItems = () => Array.from(host().querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const press = (el: HTMLElement, key: string) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    beforeEach(() => {
      fixture.componentRef.setInput('menuItems', grouped);
      fixture.detectChanges();
      document.body.appendChild(host());
    });

    afterEach(() => host().remove());

    it('gathers the items under a heading into a group labeled by it', () => {
      const groups = Array.from(host().querySelectorAll('[role="group"]'));
      expect(groups.length).toBe(2);
      expect(menuItems().length).toBe(3);

      const names = groups.map((group) => {
        const heading = document.getElementById(group.getAttribute('aria-labelledby')!)!;
        expect(group.contains(heading)).toBe(true);
        expect(heading.getAttribute('role')).toBe('presentation');
        return heading.textContent?.trim();
      });
      expect(names).toEqual(['Fruit', 'Greens']);
      expect(groups.map((group) => group.querySelectorAll('[role="menuitem"]').length)).toEqual([
        2, 1,
      ]);
      // The divider stays between the groups, a direct child of the menu.
      expect(host().querySelector('[role="menu"] > [role="separator"]')).not.toBeNull();
    });

    it('leaves items with no heading above them as direct children of the menu', () => {
      fixture.componentRef.setInput('menuItems', [
        { label: 'Loose' },
        { heading: 'Fruit' },
        { label: 'Apple' },
        { divider: true },
        { label: 'After' },
      ]);
      fixture.detectChanges();

      const direct = Array.from(
        host().querySelectorAll('[role="menu"] > [role="menuitem"]')
      ).map((el) => el.textContent?.trim());
      expect(direct).toEqual(['Loose', 'After']);
      expect(host().querySelectorAll('[role="group"]').length).toBe(1);
    });

    it('opens onto the first item and moves past headings and dividers', () => {
      const [apple, banana, fennel] = menuItems();

      fixture.componentInstance.onOpened();
      expect(document.activeElement).toBe(apple);

      press(apple, 'ArrowDown');
      expect(document.activeElement).toBe(banana);
      press(banana, 'ArrowDown');
      expect(document.activeElement).toBe(fennel);
      press(fennel, 'Home');
      expect(document.activeElement).toBe(apple);
      press(apple, 'End');
      expect(document.activeElement).toBe(fennel);
    });

    it('does not match a heading in typeahead', () => {
      const [apple] = menuItems();
      apple.focus();

      // "g" is the first letter of the Greens heading and of no item.
      press(apple, 'g');
      expect(document.activeElement).toBe(apple);

      press(apple, 'f');
      expect(document.activeElement?.textContent?.trim()).toBe('Fennel');
    });

    it('ignores a click on a heading', () => {
      let clicked: MenuItem | undefined;
      fixture.componentInstance.menuItemClicked.subscribe((item) => (clicked = item));

      host().querySelector<HTMLElement>('[role="presentation"]')!.click();
      expect(clicked).toBeUndefined();
    });

    it('renders nothing for a heading with no items under it', () => {
      fixture.componentRef.setInput('menuItems', [
        { heading: 'Empty' },
        { divider: true },
        { heading: 'Also empty' },
        { heading: 'Fruit' },
        { label: 'Apple' },
        { heading: 'Trailing' },
      ]);
      fixture.detectChanges();

      const headings = Array.from(host().querySelectorAll('[role="presentation"]')).map((el) =>
        el.textContent?.trim()
      );
      expect(headings).toEqual(['Fruit']);
    });

    it('styles the heading from the menu theme options, aligned with the items', () => {
      const heading = host().querySelector<HTMLElement>('[role="presentation"]')!;
      const styles = stylesFor(heading.className);
      // Base theme: 28px tall; padding falls back to menuItem's `md` (16px).
      expect(styles).toContain('height:28px');
      expect(styles).toContain('padding-inline:16px');
      expect(styles).toContain(TestBed.inject(ThemeService).colors()['on-surface-variant']);
    });
  });
});
