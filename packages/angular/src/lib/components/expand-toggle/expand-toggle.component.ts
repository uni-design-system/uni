import { Component, HostBinding, model } from '@angular/core';
import { css } from '@emotion/css';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniTooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'uni-expand-toggle, ExpandToggle',
  standalone: true,
  imports: [UniIconButtonComponent, UniTooltipComponent],
  template: `<Tooltip
    [label]="collapsed() ? 'Expand' : 'Collapse'"
    placement="right"
    [appendToBody]="true"
  >
    <button icon-button iconName="chevronUp" (click)="toggle()">
      {{ collapsed() ? 'Expand' : 'Collapse' }}
    </button>
  </Tooltip>`,
  host: {
    '[attr.toggled]': 'collapsed() || null',
  },
})
export class UniExpandToggleComponent {
  collapsed = model(true);

  @HostBinding('class') get className() {
    return css({
      display: 'inline-flex',
      cursor: 'pointer',

      transition: 'transform 350ms ease-in-out',
      transform: 'rotate(0)',

      '&[toggled]': {
        transform: 'rotate(-180deg)',
      },
    });
  }

  toggle() {
    this.collapsed.update((collapsed) => !collapsed);
  }
}
