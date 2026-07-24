import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { css } from '@emotion/css';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniTooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'uni-expand-toggle',
  imports: [UniIconButtonComponent, UniTooltipComponent],
  template: `<uni-tooltip
    [label]="collapsed() ? 'Expand' : 'Collapse'"
    placement="right"
  >
    <button
      icon-button
      iconName="chevronUp"
      (click)="toggle()"
      [attr.aria-expanded]="!collapsed()"
      [attr.aria-controls]="ariaControls() || null"
    >
      {{ collapsed() ? 'Expand' : 'Collapse' }}
    </button>
  </uni-tooltip>`,
  host: {
    '[class]': 'className()',
    '[attr.toggled]': 'collapsed() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniExpandToggleComponent {
  collapsed = model(true);

  /** Id of the Expand region this toggle controls (see UniExpandComponent.regionId). */
  ariaControls = input<string>();

  protected readonly className = computed(() => {
    return css({
      display: 'inline-flex',
      cursor: 'pointer',

      transition: 'transform 350ms ease-in-out',
      transform: 'rotate(0)',

      '&[toggled]': {
        transform: 'rotate(-180deg)',
      },
    });
  });

  toggle() {
    this.collapsed.update((collapsed) => !collapsed);
  }
}
