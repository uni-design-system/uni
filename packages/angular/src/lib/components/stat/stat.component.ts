import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { visuallyHidden } from '../../cdk';
import type { UniStatOptions } from './stat.model';

const SPARK_WIDTH = 96;
const SPARK_HEIGHT = 28;

/**
 * KPI stat tile: muted label, large value (numbers auto-compact: 48234 →
 * "48.2K"), an optional delta whose ink is decided by *direction × whether up
 * is good* (never direction alone — churn going down is good news), and an
 * optional decorative sparkline. Frame, typography and inks are all `stat`
 * theme tokens.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-stat, Stat',
  providers: [{ provide: COMPONENT_NAME, useValue: 'stat' }],
  host: { '[class]': 'className()' },
  template: `
    <span class="uni-stat-label">{{ label() }}</span>
    <span class="uni-stat-value">{{ displayValue() }}</span>
    @if (delta()) {
      <span class="uni-stat-meta">
        <span class="uni-stat-delta" [class.good]="deltaIsGood()">
          <span aria-hidden="true">{{ deltaIsUp() ? '▴' : '▾' }}</span>
          <span [class]="srOnly">{{ deltaIsUp() ? 'up' : 'down' }}</span>
          {{ deltaMagnitude() }}
        </span>
        @if (caption()) {
          <span class="uni-stat-caption">{{ caption() }}</span>
        }
      </span>
    }
    @if (sparkline(); as spark) {
      <svg
        class="uni-stat-trend"
        aria-hidden="true"
        [attr.width]="spark.width"
        [attr.height]="spark.height"
        [attr.viewBox]="'0 0 ' + spark.width + ' ' + spark.height"
      >
        <path
          [attr.d]="spark.path"
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle [attr.cx]="spark.endX" [attr.cy]="spark.endY" r="3.5" />
      </svg>
    }
  `,
})
export class UniStatComponent extends BaseComponent<UniStatOptions> {
  /** What is being measured, sentence case. */
  label = input.required<string>();
  /** The headline number: strings render verbatim, numbers auto-compact. */
  value = input.required<string | number>();
  /** Signed change, e.g. "+12.4%" or "-0.4%". The sign drives the arrow. */
  delta = input<string>();
  /** Whether an upward movement is good news. Flip for churn, errors, cost. */
  upIsGood = input(true);
  /** Names the comparison period, e.g. "vs last month". */
  caption = input<string>();
  /** Recent values for the decorative sparkline (12 points reads best). */
  trend = input<number[] | undefined>(undefined);

  protected readonly srOnly = css(visuallyHidden);

  protected readonly displayValue = computed(() => {
    const value = this.value();
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat(undefined, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  });

  protected readonly deltaIsUp = computed(() => !this.delta()?.trim().startsWith('-'));
  protected readonly deltaIsGood = computed(() => this.deltaIsUp() === this.upIsGood());
  protected readonly deltaMagnitude = computed(() => this.delta()?.trim().replace(/^[-+]/, '') ?? '');

  protected readonly sparkline = computed(() => {
    const points = this.trend();
    if (!points || points.length < 2) return undefined;
    const min = Math.min(...points);
    const range = Math.max(...points) - min || 1;
    const step = SPARK_WIDTH / (points.length - 1);
    const xy = points.map((p, i): [number, number] => [
      i * step,
      SPARK_HEIGHT - 3 - ((p - min) / range) * (SPARK_HEIGHT - 6),
    ]);
    const [endX, endY] = xy[xy.length - 1];
    return {
      width: SPARK_WIDTH,
      height: SPARK_HEIGHT,
      path: xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' '),
      endX: endX.toFixed(1),
      endY: endY.toFixed(1),
    };
  });

  protected readonly className = computed(() => {
    const options = this.componentOptions();
    return css({
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      ...this.theme.gap(options.gap),
      ...this.theme.colorPair(options.color),
      ...this.theme.border(options.border),
      ...this.theme.radius(options.borderRadius),
      ...this.theme.padding(options.padding),
      '& .uni-stat-label': {
        ...this.theme.typeface(options.labelTypeface),
        ...this.theme.color('on-background-variant'),
      },
      '& .uni-stat-value': {
        ...this.theme.typeface(options.valueTypeface),
        ...this.theme.color('on-background'),
      },
      '& .uni-stat-meta': {
        display: 'flex',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        columnGap: 8,
      },
      '& .uni-stat-delta': {
        fontSize: 13,
        fontWeight: 600,
        ...this.theme.color(options.negativeColor),
        '&.good': this.theme.color(options.positiveColor),
      },
      '& .uni-stat-caption': {
        fontSize: 11.5,
        ...this.theme.color('on-background-variant'),
      },
      '& .uni-stat-trend': {
        position: 'absolute',
        right: 16,
        bottom: 14,
        '& path': { stroke: this.theme.colors()[options.trendColor ?? 'outline'] },
        '& circle': { fill: this.theme.colors()[options.trendAccent ?? 'primary'] },
      },
    });
  });
}
