import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css, keyframes } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { motionSafe } from '../../cdk';
import type { SkeletonShape, UniSkeletonOptions } from './skeleton.model';

/**
 * Loading placeholder painted with surface tokens. `text` renders one or more
 * lines (the last line shortened, as real text would be), `rect` and `circle`
 * render fixed shapes. The shimmer only animates when the user allows motion;
 * it degrades to static blocks under `prefers-reduced-motion`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-skeleton, Skeleton',
  providers: [{ provide: COMPONENT_NAME, useValue: 'skeleton' }],
  host: { '[class]': 'className()', 'aria-hidden': 'true' },
  template: `
    @for (line of lineWidths(); track $index) {
      <div class="uni-skeleton-block" [style.width]="line"></div>
    }
  `,
})
export class UniSkeletonComponent extends BaseComponent<UniSkeletonOptions> {
  shape = input<SkeletonShape>('text');
  /** CSS width; defaults to 100% for text/rect and `height` for circles. */
  width = input<string | number | undefined>(undefined);
  /** CSS height per block; defaults to 1em (text), 96px (rect), 40px (circle). */
  height = input<string | number | undefined>(undefined);
  /** Number of text lines (text shape only). */
  lines = input(1);

  private readonly cssSize = (value: string | number): string =>
    typeof value === 'number' ? `${value}px` : value;

  protected readonly resolvedHeight = computed(() => {
    const height = this.height();
    if (height !== undefined) return this.cssSize(height);
    return { text: '1em', rect: '96px', circle: '40px' }[this.shape()];
  });

  protected readonly lineWidths = computed(() => {
    const width = this.width() !== undefined ? this.cssSize(this.width()!) : undefined;
    if (this.shape() === 'circle') return [width ?? this.resolvedHeight()];
    if (this.shape() === 'rect') return [width ?? '100%'];
    const lines = Math.max(1, this.lines());
    // Multi-line text blocks end on a short line, like real paragraphs do.
    return Array.from({ length: lines }, (_, i) =>
      lines > 1 && i === lines - 1 ? (width ?? '60%') : (width ?? '100%')
    );
  });

  private readonly sweep = keyframes({
    from: { backgroundPosition: '200% 0' },
    to: { backgroundPosition: '-200% 0' },
  });

  protected readonly className = computed(() => {
    const options = this.componentOptions();
    const base = this.theme.colors()[options.color ?? 'surface-variant'];
    const highlight = this.theme.colors()[options.highlightColor ?? 'surface'];
    const animated = (options.animation ?? 'shimmer') === 'shimmer';
    return css({
      display: 'flex',
      flexDirection: 'column',
      ...this.theme.gap(options.gap),
      '& .uni-skeleton-block': {
        height: this.resolvedHeight(),
        backgroundColor: base,
        ...(this.shape() === 'circle'
          ? { borderRadius: '50%', flex: 'none' }
          : this.theme.radius(options.borderRadius)),
        ...(animated &&
          motionSafe({
            backgroundImage: `linear-gradient(90deg, ${base} 40%, ${highlight} 50%, ${base} 60%)`,
            backgroundSize: '200% 100%',
            animation: `${this.sweep} ${options.duration ?? 1.4}s ease-in-out infinite`,
          })),
      },
    });
  });
}
