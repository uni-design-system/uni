import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';

import { ThemeService } from '../../theming/theme.service';
import type { ColorToken, Icons } from '@uni-design-system/uni-core';

@Component({
  selector: 'uni-icon, Icon',
  imports: [],
  template: '',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Icons are decorative; meaningful icons get their name from the parent control
  host: {
    'aria-hidden': 'true',
    '[class]': 'className()',
    '[style.-webkit-mask-image]': 'path()',
  },
})
export class UniIconComponent {
  private themeService = inject(ThemeService);

  color = input<ColorToken>();
  name = input.required<keyof Icons>();

  protected readonly path = computed(
    () => `url("${this.themeService.theme().icons[this.name()]}")`
  );

  protected readonly className = computed(() =>
    css([{ ...this.themeService.color(this.color()) }])
  );
}
