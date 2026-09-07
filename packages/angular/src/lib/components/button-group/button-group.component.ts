import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { css } from '@emotion/css';
import type { UniButtonGroupOptions } from './button-group.model';
import { ThemeService } from '../../theming';

@Component({
  selector: 'uni-button-group',
  imports: [],
  template: ` <ng-content></ng-content>`,
  host: { '[class]': 'className()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniButtonGroupComponent {
  private themeService = inject(ThemeService);
  protected readonly componentOptions =
    this.themeService.getComponentOptions<UniButtonGroupOptions>('buttonGroup');

  protected readonly className = computed(() => {
    const options = this.componentOptions();
    const radius = options.borderRadius ?? 4;
    return css({
      display: 'inline-flex',

      '& button': {
        ...this.themeService.border(options.border ?? 'quaternary'),
        marginRight: -1,
      },

      '& button:first-child': {
        borderTopLeftRadius: radius,
        borderBottomLeftRadius: radius,
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
        borderTopRightRadius: radius,
        borderBottomRightRadius: radius,
        marginRight: 0,
      },
    });
  });
}
