import { Component, HostBinding, inject } from '@angular/core';
import { css } from '@emotion/css';
import { ThemeService } from '../../theming';

@Component({
  selector: 'uni-button-group, ButtonGroup',
  standalone: true,
  imports: [],
  template: ` <ng-content></ng-content>`,
})
export class UniButtonGroupComponent {
  private themeService = inject(ThemeService);

  @HostBinding('class') get className() {
    return css({
      display: 'inline-flex',

      '& button': {
        ...this.themeService.border('quaternary'),
        marginRight: -1,
      },

      '& button:first-child': {
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },

      '& button:not(:first-child):not(:last-child)': {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },

      '& button:last-child': {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        marginRight: 0,
      },
    });
  }
}
