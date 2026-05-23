import { Component, HostBinding, inject, input } from '@angular/core';
import { css } from '@emotion/css';
import { ThemeService } from '../../theming/theme.service';
import type { Border, Orientation } from '@uni-design-system/uni-core';

@Component({
  selector: 'oui-divider, Divider',
  standalone: true,
  imports: [],
  template: ``,
})
export class UniDividerComponent {
  themeService = inject(ThemeService);

  orientation = input<Orientation>('horizontal');
  border = input<Border>('primary');

  @HostBinding('class') get className() {
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
  }
}
