import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';
import { ThemeService } from '../../theming';
import type { Border, Orientation } from '@uni-design-system/uni-core';

@Component({
  selector: 'uni-divider, Divider',
  imports: [],
  template: ``,
  host: { '[class]': 'className()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniDividerComponent {
  themeService = inject(ThemeService);

  orientation = input<Orientation>('horizontal');
  border = input<Border>('primary');

  protected readonly className = computed(() => {
    return css([
      {
        display: 'block',
      },
      this.orientation() === 'horizontal' && {
        ...this.themeService.borderBottom(this.border()),
        width: '100%',
      },
      this.orientation() === 'vertical' && {
        ...this.themeService.borderLeft(this.border()),
        height: '100%',
      },
    ]);
  });
}
