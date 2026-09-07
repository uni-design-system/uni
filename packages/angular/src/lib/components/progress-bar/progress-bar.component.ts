import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';
import { ThemeService } from '../../theming';
import type { UniProgressBarOptions } from './progress-bar.model';

@Component({
  selector: 'uni-progress-bar',
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
  protected readonly componentOptions =
    this.theme.getComponentOptions<UniProgressBarOptions>('progressBar');

  palette = this.theme.colors;

  /** Every paint the bar uses, resolved through the theme entry. */
  protected readonly paint = computed(() => {
    const options = this.componentOptions();
    const palette = this.palette();
    return {
      track: palette[options.trackColor ?? 'primary-surface'],
      fill: palette[options.fillColor ?? 'secondary-surface'],
      complete: palette[options.completeColor ?? 'secondary'],
      border: palette[options.borderColor ?? 'on-background-variant'],
    };
  });

  width = input<number>(560);
  height = input<number>(24);
  percent = input<number>(0);

  /** Accessible name describing what is progressing (e.g. "Upload progress"). */
  ariaLabel = input<string>();

  protected readonly stroke = computed(() => this.componentOptions().strokeWidth ?? 1);

  protected readonly className = computed(() => {
    return css([{ display: 'block' }]);
  });

  protected readonly Math = Math;
}
