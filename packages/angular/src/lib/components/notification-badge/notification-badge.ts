import { Component, computed, HostBinding, input } from '@angular/core';
import { css } from '@emotion/css';
import type { Variant } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextComponent } from '../text';
import { visuallyHidden } from '../../cdk';
import type { UniNotificationBadgeOptions } from './notification-badge.model';

@Component({
  selector: 'uni-notification-badge',
  imports: [UniTextComponent],
  templateUrl: './notification-badge.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'notificationBadge' }],
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

  @HostBinding('class') get className() {
    const variant = this.badgeVariant();
    const color = this.color();
    const position = this.position();
    const offset = this.componentOptions().offset + 'px';

    const positionStyles = {
      'top-right': { top: offset, right: offset },
      'top-left': { top: offset, left: offset },
      'bottom-right': { bottom: offset, right: offset },
      'bottom-left': { bottom: offset, left: offset },
    }[position];

    const variantStyles = {
      dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        minWidth: 'unset',
      },
      count: {
        width: 20,
        height: 20,
        borderRadius: 10,
      },
      pill: {
        minWidth: '24px',
        height: '20px',
        borderRadius: '10px',
        padding: '0 8px',
      },
    }[variant];

    return css({
      position: 'relative',
      display: 'inline-block',

      '& .notification-badge-indicator': {
        position: 'absolute',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...this.theme.getContainerColors(color || 'warn'),
        zIndex: 1,

        ...positionStyles,
        ...variantStyles,
      },
    });
  }
}
