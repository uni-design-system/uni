import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';

import { ThemeService } from '../../theming/theme.service';
import type { ColorToken, Icons } from '@uni-design-system/uni-core';

@Component({
  selector: 'uni-icon',
  imports: [],
  template: '',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Icons are decorative; meaningful icons get their name from the parent control
  host: {
    'aria-hidden': 'true',
    '[class]': 'className()',
    '[style.mask-image]': 'path()',
    '[style.-webkit-mask-image]': 'path()',
  },
})
export class UniIconComponent {
  private themeService = inject(ThemeService);

  color = input<ColorToken>();
  name = input.required<keyof Icons>();

  /** Resolved from the theme's icon primitives; unknown names render nothing. */
  protected readonly path = computed(() => {
    const icon = this.themeService.theme().icons[this.name()];
    return icon ? `url("${icon}")` : 'none';
  });

  protected readonly className = computed(() =>
    css([{ ...this.themeService.color(this.color()) }])
  );
}
