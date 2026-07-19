import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';
import { ThemeService } from '../../theming';

@Component({
  selector: 'uni-progress-bar, ProgressBar',
  imports: [],
  templateUrl: './progress-bar.component.html',
  host: {
    '[class]': 'className()',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'percent()',
    '[attr.aria-label]': "ariaLabel() || 'Progress'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniProgressBarComponent {
  theme = inject(ThemeService);

  palette = this.theme.colors;

  width = input<number>(560);
  height = input<number>(24);
  percent = input<number>(0);

  /** Accessible name describing what is progressing (e.g. "Upload progress"). */
  ariaLabel = input<string>();

  stroke = 1;

  protected readonly className = computed(() => {
    return css([{ display: 'block' }]);
  });

  protected readonly Math = Math;
}
