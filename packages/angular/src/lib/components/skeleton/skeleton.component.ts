import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css, keyframes } from '@emotion/css';
import type { ColorKey, Radius } from '@uni-design-system/uni-core';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { motionSafe, visuallyHidden } from '../../cdk';
import type { SkeletonShape, UniSkeletonOptions } from './skeleton.model';

/**
 * Loading placeholder painted with surface tokens. `text` renders one or more
 * lines (the last line shortened, as real text would be), `rect` and `circle`
 * render fixed shapes. The shimmer only animates when the user allows motion;
 * it degrades to static blocks under `prefers-reduced-motion`.
 *
 * Color and radius are theme options with per-instance overrides, because one
 * app routinely needs several: skeletons on a card and on the page background
 * want different tints, and a pill placeholder wants a different corner than
 * the text bars beside it.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-skeleton',
  providers: [{ provide: COMPONENT_NAME, useValue: 'skeleton' }],
  host: {
    '[class]': 'className()',
    '[attr.aria-hidden]': 'label() ? null : true',
    '[attr.role]': "label() ? 'status' : null",
  },
  template: `
    @if (label(); as text) {
      <span [class]="srOnly">{{ text }}</span>
    }
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
  /** Base color token; overrides the theme option for this skeleton. */
  color = input<ColorKey | undefined>(undefined);
  /** Shimmer highlight token; overrides the theme option for this skeleton. */
  highlightColor = input<ColorKey | undefined>(undefined);
  /** Radius token; overrides the theme option. Circles are always round. */
  borderRadius = input<Radius | undefined>(undefined);
  /**
   * Announces the skeleton to assistive tech as a polite status. Leave unset
   * when a container already carries `aria-busy` — the skeleton then stays
   * `aria-hidden`, as a decorative placeholder should.
   */
  label = input<string | undefined>(undefined);

  protected readonly srOnly = css(visuallyHidden);

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

  /**
   * The band is `bandWidth`% of the block, so it clears the block after
   * travelling `100 / bandWidth` of its own width — the offsets below are
   * percentages of the band, not of the block.
   */
  private readonly sweep = (bandWidth: number, direction: 'ltr' | 'rtl') => {
    const travel = `${Number(((100 / bandWidth) * 100).toFixed(2))}%`;
    const [from, to] = direction === 'rtl' ? [travel, '-100%'] : ['-100%', travel];
    return keyframes({
      from: { transform: `translateX(${from})` },
      to: { transform: `translateX(${to})` },
    });
  };

  protected readonly className = computed(() => {
    const options = this.componentOptions();
    const base = this.theme.colors()[this.color() ?? options.color ?? 'surface-variant'];
    const highlight =
      this.theme.colors()[this.highlightColor() ?? options.highlightColor ?? 'surface'];
    const animated = (options.animation ?? 'shimmer') === 'shimmer';
    const bandWidth = Math.max(1, options.highlightWidth ?? 40);
    return css({
      display: 'flex',
      flexDirection: 'column',
      ...this.theme.gap(options.gap),
      '& .uni-skeleton-block': {
        position: 'relative',
        overflow: 'hidden',
        height: this.resolvedHeight(),
        backgroundColor: base,
        ...(this.shape() === 'circle'
          ? { borderRadius: '50%', flex: 'none' }
          : this.theme.radius(this.borderRadius() ?? options.borderRadius)),
        ...(animated &&
          motionSafe({
            // A translated band composites; animating background-position
            // repaints the block every frame. Both gradient ends are the base
            // color, so the band dissolves into the block with no alpha and
            // no fringing where it meets the edges.
            '&::after': {
              content: '""',
              position: 'absolute' as const,
              insetBlock: 0,
              left: 0,
              width: `${bandWidth}%`,
              backgroundImage: `linear-gradient(90deg, ${base} 0%, ${highlight} 50%, ${base} 100%)`,
              animation: `${this.sweep(bandWidth, options.direction ?? 'ltr')} ${
                options.duration ?? 1.4
              }s ease-in-out infinite`,
            },
          })),
      },
    });
  });
}
