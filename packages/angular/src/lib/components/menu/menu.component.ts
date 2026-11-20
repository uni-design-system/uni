import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import { css } from '@emotion/css';
import { type Placement } from '../../cdk';

import { UniMenuItemComponent } from './menu-item/menu-item.component';
import {
  isDivider,
  isHeading,
  type MenuItem,
  type MenuItemWithLabel,
  type MenuItemWithTemplate,
  type UniMenuItemOptions,
} from './menu-item/menu-item.model';
import type { UniMenuOptions } from './menu.model';
import { UniDropdownComponent } from '../dropdown';
import { ThemeService } from '../../theming';

type MenuAction = MenuItemWithLabel | MenuItemWithTemplate;

/** What the template renders: the flat `menuItems` with headed runs gathered into groups. */
type MenuEntry =
  | { kind: 'divider' }
  | { kind: 'item'; item: MenuAction }
  | { kind: 'group'; heading: string; id: string; items: MenuAction[] };

let nextMenuId = 0;

@Component({
  selector: 'uni-menu',
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
      <uni-dropdown
        [trigger]="trigger"
        [placement]="placement()"
        ariaHasPopup="menu"
        [containerColor]="menuOptions().color"
        [border]="menuOptions().border"
        [borderRadius]="menuOptions().borderRadius"
        [shadow]="menuOptions().shadow"
        [paddingVertical]="menuOptions().paddingVertical"
        [paddingHorizontal]="menuOptions().paddingHorizontal"
        #dropdown
        (dropdownShowing)="onOpened()"
      >
        <!-- Roving-focus composite: the container handles keys bubbling from
             the focused item (menu-item hosts carry tabindex="-1"), and
             Enter/Space activation is dispatched from onMenuKeydown. -->
        <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
        <div role="menu" [class]="menuClassName()" (keydown)="onMenuKeydown($event, dropdown)">
          <!-- track $index: items carry no stable key (template items have no
               label, labels may repeat, dividers have neither) and consumers
               naturally rebuild the array each CD pass — identity tracking
               recreated every node and tripped NG0956. -->
          @for (entry of entries(); track $index) {
            @switch (entry.kind) {
              @case ('divider') {
                <div role="separator" [class]="dividerClassName()"></div>
              }
              @case ('group') {
                <!-- A heading names the items under it: they sit in a group
                     labeled by the heading, which is text only — never a
                     menuitem, so it is no stop for arrows or typeahead. -->
                <div role="group" [attr.aria-labelledby]="entry.id">
                  <div role="presentation" [id]="entry.id" [class]="headingClassName()">
                    {{ entry.heading }}
                  </div>
                  @for (item of entry.items; track $index) {
                    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
                    <div
                      menu-item
                      [label]="item.label"
                      [description]="item.description"
                      [symbolName]="item.symbolName"
                      [active]="activeItem() === item"
                      [template]="item.template"
                      [context]="item.context"
                      [variant]="item.variant"
                      [disabled]="item.disabled ?? false"
                      (click)="handleMenuItemClick(item, dropdown)"
                    ></div>
                  }
                </div>
              }
              @case ('item') {
                @let item = entry.item;
                <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
                <div
                  menu-item
                  [label]="item.label"
                  [description]="item.description"
                  [symbolName]="item.symbolName"
                  [active]="activeItem() === item"
                  [template]="item.template"
                  [context]="item.context"
                  [variant]="item.variant"
                  [disabled]="item.disabled ?? false"
                  (click)="handleMenuItemClick(item, dropdown)"
                ></div>
              }
            }
          }
        </div>
      </uni-dropdown>
    }
  `,
  host: { '[class]': 'className()' },
})
export class UniMenuComponent {
  private theme = inject(ThemeService);

  // Modern Signal Inputs for perfect Zoneless tracking
  menuItems = input.required<MenuItem[]>();
  activeItem = input<MenuItem>();
  placement = input<Placement>('bottom-start');

  // Modern Signal Output
  menuItemClicked = output<MenuItem>();

  TriggerClassName = css({ display: 'inline-block' });

  private readonly uid = nextMenuId++;

  /**
   * The flat `menuItems` array as render entries. A heading opens a group that
   * runs to the next heading or divider; items with no heading above them stay
   * direct children of the menu, exactly as before headings existed. A heading
   * with no items under it is dropped.
   */
  protected readonly entries = computed<MenuEntry[]>(() => {
    const entries: MenuEntry[] = [];
    let group: Extract<MenuEntry, { kind: 'group' }> | undefined;
    const flush = () => {
      if (group?.items.length) entries.push(group);
      group = undefined;
    };

    this.menuItems().forEach((item, index) => {
      if (isHeading(item)) {
        flush();
        group = {
          kind: 'group',
          heading: item.heading,
          id: `uni-menu-${this.uid}-heading-${index}`,
          items: [],
        };
      } else if (isDivider(item)) {
        flush();
        entries.push({ kind: 'divider' });
      } else if (group) {
        group.items.push(item);
      } else {
        entries.push({ kind: 'item', item });
      }
    });
    flush();
    return entries;
  });

  protected readonly menuOptions = computed(() =>
    this.theme.getComponentOptions<UniMenuOptions>('menu')()
  );

  protected readonly menuClassName = computed(() =>
    css({ minWidth: this.menuOptions().minWidth })
  );

  protected readonly dividerClassName = computed(() => {
    const { dividerBorder, dividerSpacing } = this.menuOptions();
    const spacing = this.theme.getSpacing(dividerSpacing ?? 'none');
    return css({
      ...this.theme.borderTop(dividerBorder),
      marginBlock: spacing,
      marginInline: spacing,
    });
  });

  protected readonly headingClassName = computed(() => {
    const { headingTypeface, headingColor, headingHeight, headingPaddingHorizontal } =
      this.menuOptions();
    const itemPadding =
      this.theme.getComponentOptions<UniMenuItemOptions>('menuItem')().paddingHorizontal;
    return css({
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      cursor: 'default',
      whiteSpace: 'nowrap',
      height: headingHeight,
      ...this.theme.horizontalPadding(headingPaddingHorizontal ?? itemPadding),
      ...this.theme.typeface(headingTypeface),
      ...this.theme.color(headingColor),
    });
  });

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
    if (!isDivider(item) && !isHeading(item) && item.action) {
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
