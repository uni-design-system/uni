import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';

import { type IconName } from '../icon/icon.record';
import { RippleDirective } from '../../directives';
import { UniSymbolComponent } from '../symbol';
import { UniIconComponent } from '../icon';
import { ThemeService } from '../../theming/theme.service';
import { visuallyHidden } from '../../cdk';
import type { Size, Variant } from '@uni-design-system/uni-core';

@Component({
  selector: 'button[uni-icon-button], button[icon-button]',
  imports: [UniSymbolComponent, UniIconComponent],
  template: `
    @if (loading()) {
      <Icon name="spinner" />
    } @else if (symbolName()) {
      <Symbol [name]="symbolName()!" [opticalSize]="opticalSize()" />
    } @else if (iconName()) {
      <Icon [name]="iconName()!" />
    }
    <!-- Projected text is the button's accessible name (visually hidden) -->
    <span [class]="srOnlyClass"><ng-content /></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.disabled]': 'disable() || loading() || null',
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[attr.aria-label]': 'ariaLabel() || null',
    '[class]': 'className()',
  },
  hostDirectives: [{ directive: RippleDirective }],
})
export class UniIconButtonComponent {
  private theme = inject(ThemeService);
  config = this.theme.component('iconButton');

  /**
   * Accessible name for the button. Alternative to projecting text content
   * (`<button icon-button>Close</button>`); one of the two is required for
   * an icon-only button to be announced correctly.
   */
  ariaLabel = input<string>();

  iconName = input<IconName>();
  symbolName = input<string>();
  variant = input<Variant>('ghost');
  size = input<Size>('lg');
  disable = input<boolean>();
  loading = input<boolean>();
  opticalSize = input(24);

  protected readonly srOnlyClass = css(visuallyHidden);

  protected readonly className = computed(() => {
    const { sizes, variants } = this.config();
    const sizeConfig = sizes && sizes[this.size()];
    const colorConfig = variants && variants[this.variant()];

    return css([
      {
        position: 'relative',
        overflow: 'hidden',
        outline: 0,
        border: 0,
        cursor: 'pointer',
        transition: 'all 0.28s ease',
        borderRadius: 999,
        display: 'block',

        '&:disabled': {
          cursor: 'not-allowed !important',
        },

        '& symbol': {
          fontSize: 'inherit',
          lineHeight: 'inherit',
        },
      },
      sizeConfig && {
        ...sizeConfig,
      },
      colorConfig && {
        ...colorConfig,
      },
      this.symbolName() &&
        !this.loading() && {
          padding: 0,
        },
      this.variant() !== 'ghost' && {
        '&:hover': {
          ...this.theme.boxShadow('raised'),
        },
      },
      this.variant() === 'ghost' && {
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,0.1)',
        },
      },
      !this.loading() && {
        '&:disabled': {
          ...this.config().variants?.disabled,
        },
      },
    ]);
  });
}
