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

  it('marks the active item with the theme activeSymbol', () => {
    fixture.componentRef.setInput('activeItem', items[1]);
    fixture.detectChanges();

    const menuItems = (fixture.nativeElement as HTMLElement).querySelectorAll('[role="menuitem"]');
    expect(menuItems[1].textContent).toContain('check');
    expect(menuItems[0].textContent).not.toContain('check');
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
});
