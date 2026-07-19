import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css, keyframes } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';

@Component({
  selector: 'uni-progress-gauge, ProgressGauge',
  imports: [],
  templateUrl: './progress-gauge.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'progressGauge' }],
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
export class UniProgressGaugeComponent extends BaseComponent {
  percent = input<number>(0);

  /** Accessible name describing what is progressing. */
  ariaLabel = input<string>();

  textStyle = computed(() => {
    const theme = this.componentTheme();
    return theme.fixed && theme.fixed['textFill'];
  });

  private progress = keyframes({
    '0%': { strokeDasharray: '0 100' },
  });

  protected readonly className = computed(() => {
    return css({
      display: 'block',

      '& .circular-chart': {
        display: 'block',
      },

      '& .circle-bg': {
        fill: 'none',
        strokeWidth: 3.8,
      },

      '& .circle': {
        fill: 'none',
        strokeWidth: 3.8,
        animation: `${this.progress} 1s ease-out forwards`,
      },

      '& .percentage': {
        fontFamily: 'sans-serif',
        fontSize: '0.5em',
        textAnchor: 'middle',
      },
    });
  });
}
