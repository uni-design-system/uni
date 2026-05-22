import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  inject,
  input,
  output,
} from '@angular/core';
import { css } from '@emotion/css';
import { Placement } from '@floating-ui/dom';

import { UniMenuItemComponent } from './menu-item/menu-item.component';
import { MenuItem } from './menu-item/menu-item.model';
import { UniDropdownComponent } from '../dropdown';

@Component({
  selector: 'Menu, oui-menu',
  standalone: true,
  imports: [UniMenuItemComponent, UniDropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush, // Crucial for zoneless
  template: `
    <div #trigger [class]="TriggerClassName">
      <ng-content></ng-content>
    </div>

    @if (menuItems()) {
      <Dropdown [trigger]="trigger" [placement]="placement()" paddingVertical="xs" #dropdown>
        @for (item of menuItems(); track item) {
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
      </Dropdown>
    }
  `,
})
export class UniMenuComponent {
  private cdr = inject(ChangeDetectorRef);

  // Modern Signal Inputs for perfect Zoneless tracking
  menuItems = input.required<MenuItem[]>();
  activeItem = input<MenuItem>();
  placement = input<Placement>('bottom-start');

  // Modern Signal Output
  menuItemClicked = output<MenuItem>();

  TriggerClassName = css({ display: 'inline-block' });

  @HostBinding('class') get className() {
    return css({
      margin: 'unset',
      padding: 'unset',
    });
  }

  handleMenuItemClick(item: MenuItem, dropdown: UniDropdownComponent) {
    if (item.action) {
      item.action();
    }

    this.menuItemClicked.emit(item);
    dropdown.hideDropdown();

    // Explicitly request a render tick if item.action() updated any internal state
    this.cdr.markForCheck();
  }
}
