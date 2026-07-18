import { Component, HostBinding, inject, input } from '@angular/core';
import { css } from '@emotion/css';
import { ThemeService } from '../../theming';

@Component({
  selector: 'uni-progress-bar, ProgressBar',
  standalone: true,
  imports: [],
  templateUrl: './progress-bar.component.html',
})
export class UniProgressBarComponent {
  theme = inject(ThemeService);

  palette = this.theme.colors;

  width = input<number>(560);
  height = input<number>(24);
  percent = input<number>(0);
  stroke = 1;

  @HostBinding('class') get className() {
    return css([{ display: 'block' }]);
  }

  protected readonly Math = Math;
}
