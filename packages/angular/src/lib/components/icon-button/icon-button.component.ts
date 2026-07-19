import {
  Component,
  HostBinding,
  inject,
  input,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
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
  standalone: true,
  imports: [
    RippleDirective,
    UniSymbolComponent,
    UniIconComponent,
    // Keep this import
  ],
  template: `
    @if (symbolName && !loading) {
      <Symbol [name]="symbolName" [opticalSize]="opticalSize" />
    } @else if (iconName && !loading) {
      <Icon [name]="iconName" />
    }
    <!-- Projected text is the button's accessible name (visually hidden) -->
    <span [class]="srOnlyClass"><ng-content /></span>
  `,
  host: {
    '[attr.disabled]': 'disable || loading || null',
    '[attr.aria-busy]': "loading ? 'true' : null",
    '[attr.aria-label]': 'ariaLabel() || null',
  },
  hostDirectives: [{ directive: RippleDirective }],
})
export class UniIconButtonComponent implements OnChanges {
  private theme = inject(ThemeService);
  config = this.theme.component('iconButton');

  /**
   * Accessible name for the button. Alternative to projecting text content
   * (`<button icon-button>Close</button>`); one of the two is required for
   * an icon-only button to be announced correctly.
   */
  ariaLabel = input<string>();

  protected readonly srOnlyClass = css(visuallyHidden);

  @Input() iconName?: IconName;
  @Input() symbolName?: string;
  @Input() variant: Variant = 'ghost';
  @Input() size: Size = 'lg';
  @Input() disable?: boolean;
  @Input() loading?: boolean;
  @Input() opticalSize = 24;

  @HostBinding('class') get className() {
    const { sizes, colors } = this.config();
    const sizeConfig = sizes && sizes[this.size];
    const colorConfig = colors && colors[this.variant];

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
      this.symbolName &&
        !this.loading && {
          padding: 0,
        },
      this.variant !== 'ghost' && {
        '&:hover': {
          ...this.theme.boxShadow('raised'),
        },
      },
      this.variant === 'ghost' && {
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,0.1)',
        },
      },
      !this.loading && {
        '&:disabled': {
          ...this.config().colors?.disabled,
        },
      },
    ]);
  }

  ngOnChanges(changes: SimpleChanges) {
    const { sizes, colors } = this.config();
    const sizeConfig = sizes && sizes[this.size];

    if (this.loading) this.iconName = 'spinner';
  }
}
