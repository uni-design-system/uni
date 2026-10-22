import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';
import type { StyleExpression, Variant } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextDirective } from '../text';
import { visuallyHidden } from '../../cdk';
import type { UniNotificationBadgeOptions } from './notification-badge.model';

@Component({
  selector: 'uni-notification-badge',
  imports: [UniTextDirective],
  templateUrl: './notification-badge.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'notificationBadge' }],
  host: { '[class]': 'className()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniNotificationBadgeComponent extends BaseComponent<UniNotificationBadgeOptions> {
  count = input<number | undefined>(undefined);
  maxCount = input<number>(99);
  badgeVariant = input<'dot' | 'count' | 'pill'>('count');
  color = input<Variant | undefined>(undefined);
  position = input<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top-right');
  show = input<boolean>(true);

  /**
   * Screen-reader text for the badge (e.g. "5 unread messages"). Without it
   * a sensible default is announced; a bare number or dot carries no meaning.
   */
  ariaLabel = input<string>();

  protected readonly srOnlyClass = css(visuallyHidden);

  protected readonly announcement = computed(() => {
    const label = this.ariaLabel();
    if (label) return label;
    if (this.badgeVariant() === 'dot') return 'New notifications';
    return `${this.displayValue()} notifications`;
  });

  displayValue = computed(() => {
    const count = this.count();
    const maxCount = this.maxCount();
    const variant = this.badgeVariant();

    if (variant === 'dot') {
      return '';
    }

    if (count === undefined || count <= 0) {
      return '';
    }

    if (count > maxCount) {
      return `${maxCount}+`;
    }

    return count.toString();
  });

  shouldShow = computed(() => {
    const show = this.show();
    const count = this.count();
    const variant = this.badgeVariant();

    if (!show) return false;

    if (variant === 'dot') return true;

    return count !== undefined && count > 0;
  });

  /**
   * The disc's height for the active `size`, read out of the theme's `sizes`
   * block as data — the treatment `uni-checkbox` and `uni-toggle` give theirs.
   * Falls back to the 20px every badge drew before the block existed.
   */
  private readonly discSize = computed(() => {
    const size = (this.componentTheme().sizes?.[this.size()] as StyleExpression | undefined)
      ?.height;
    return typeof size === 'number' ? size : 20;
  });

  protected readonly className = computed(() => {
    const variant = this.badgeVariant();
    const color = this.color();
    const position = this.position();
    const size = this.discSize();
    // A theme may omit `offset`; without the fallback this concatenates to
    // the invalid length 'undefinedpx' and the badge loses its position.
    const offset = (this.componentOptions().offset ?? 0) + 'px';

    const positionStyles = {
      'top-right': { top: offset, right: offset },
      'top-left': { top: offset, left: offset },
      'bottom-right': { bottom: offset, right: offset },
      'bottom-left': { bottom: offset, left: offset },
    }[position];

    // Geometry scales with the disc. A count is a circle that may widen —
    // "99+" used to be clipped inside a fixed 20px square — and a pill starts
    // wider and takes more side room.
    const dot = Math.round(size * 0.4);
    const variantStyles = {
      dot: {
        width: dot,
        height: dot,
        borderRadius: '50%',
        minWidth: 'unset',
      },
      count: {
        minWidth: size,
        height: size,
        borderRadius: size / 2,
        padding: `0 ${Math.round(size * 0.2)}px`,
      },
      pill: {
        minWidth: Math.round(size * 1.2),
        height: size,
        borderRadius: size / 2,
        padding: `0 ${Math.round(size * 0.4)}px`,
      },
    }[variant];

    return css({
      position: 'relative',
      // Inline-flex, not inline-block: an inline-block wrapper sits on the
      // text baseline and carries line-height below it, so inside a flex row
      // the wrapped link dropped a few pixels under its siblings. A wrapper
      // must not change the layout of what it wraps.
      display: 'inline-flex',
      alignItems: 'center',

      '& .notification-badge-indicator': {
        position: 'absolute',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        ...this.theme.getContainerColors(color || 'warn'),
        zIndex: 1,

        ...positionStyles,
        ...variantStyles,

        // The count's line box must not outgrow the disc, or a typeface with a
        // generous line-height pushes the digits off-centre.
        '& [uni-text]': { lineHeight: 1 },
      },
    });
  });
}
