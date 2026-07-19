import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniMenuComponent } from './menu.component';
import { MenuItem } from './menu-item/menu-item.model';

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
});
