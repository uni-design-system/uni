import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import { css } from '@emotion/css';
import { Placement } from '@floating-ui/dom';

import { UniMenuItemComponent } from './menu-item/menu-item.component';
import { MenuItem } from './menu-item/menu-item.model';
import { UniDropdownComponent } from '../dropdown';

@Component({
  selector: 'Menu, uni-menu',
  imports: [UniMenuItemComponent, UniDropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush, // Crucial for zoneless
  template: `
    <!-- Keydown listens for arrow keys bubbling from the projected (focusable)
         trigger; the wrapper itself must stay out of the tab order. -->
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
    <div #trigger [class]="TriggerClassName" (keydown)="onTriggerKeydown($event)">
      <ng-content></ng-content>
    </div>

    @if (menuItems()) {
      <Dropdown
        [trigger]="trigger"
        [placement]="placement()"
        ariaHasPopup="menu"
        paddingVertical="xs"
        #dropdown
        (dropdownShowing)="onOpened()"
      >
        <!-- Roving-focus composite: the container handles keys bubbling from
             the focused item (menu-item hosts carry tabindex="-1"), and
             Enter/Space activation is dispatched from onMenuKeydown. -->
        <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
        <div role="menu" (keydown)="onMenuKeydown($event, dropdown)">
          @for (item of menuItems(); track item) {
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <div
              menu-item
              [label]="item.label"
              [symbolName]="item.symbolName"
              [active]="activeItem() === item"
              [template]="item.template"
              [context]="item.context"
              (click)="handleMenuItemClick(item, dropdown)"
            ></div>
          }
        </div>
      </Dropdown>
    }
  `,
  host: { '[class]': 'className()' },
})
export class UniMenuComponent {
  // Modern Signal Inputs for perfect Zoneless tracking
  menuItems = input.required<MenuItem[]>();
  activeItem = input<MenuItem>();
  placement = input<Placement>('bottom-start');

  // Modern Signal Output
  menuItemClicked = output<MenuItem>();

  TriggerClassName = css({ display: 'inline-block' });

  private itemComponents = viewChildren(UniMenuItemComponent);
  private dropdownComponent = viewChild(UniDropdownComponent);

  /** Which item receives focus when the menu opens (ArrowUp opens onto the last item). */
  private pendingFocus: 'first' | 'last' = 'first';

  protected readonly className = computed(() => {
    return css({
      margin: 'unset',
      padding: 'unset',
    });
  });

  handleMenuItemClick(item: MenuItem, dropdown: UniDropdownComponent) {
    if (item.action) {
      item.action();
    }

    this.menuItemClicked.emit(item);
    dropdown.hideDropdown();
  }

  /** Enabled items participating in keyboard navigation. */
  private get navigableItems(): UniMenuItemComponent[] {
    return this.itemComponents().filter((item) => !item.disabled());
  }

  onOpened() {
    const items = this.navigableItems;
    if (items.length === 0) return;
    const target = this.pendingFocus === 'last' ? items[items.length - 1] : items[0];
    this.pendingFocus = 'first';
    target.focus();
  }

  onTriggerKeydown(event: KeyboardEvent) {
    const dropdown = this.dropdownComponent();
    if (!dropdown || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    event.preventDefault();

    this.pendingFocus = event.key === 'ArrowUp' ? 'last' : 'first';
    if (dropdown.showing()) {
      this.onOpened();
    } else {
      dropdown.toggleDropdown();
    }
  }

  onMenuKeydown(event: KeyboardEvent, dropdown: UniDropdownComponent) {
    const items = this.navigableItems;
    if (items.length === 0) return;

    const currentIndex = items.findIndex((item) => item.host === event.target);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(currentIndex + 1) % items.length].focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length].focus();
        break;
      case 'Home':
        event.preventDefault();
        items[0].focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1].focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        (event.target as HTMLElement).click();
        break;
      case 'Tab':
        // A menu is not part of the page tab sequence: close and let focus
        // return to the trigger, then continue tabbing naturally.
        dropdown.hideDropdown();
        break;
      default:
        this.typeahead(event, items, currentIndex);
    }
  }

  /** First-character matching, starting after the focused item and wrapping. */
  private typeahead(event: KeyboardEvent, items: UniMenuItemComponent[], currentIndex: number) {
    if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) return;
    const char = event.key.toLowerCase();
    if (char === ' ') return;

    for (let i = 1; i <= items.length; i++) {
      const item = items[(currentIndex + i) % items.length];
      if (item.label()?.toLowerCase().startsWith(char)) {
        event.preventDefault();
        item.focus();
        return;
      }
    }
  }
}
