import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';

import { ThemeService } from '../../theming/theme.service';
import type { ColorToken, CssLength, IconName } from '@uni-design-system/uni-core';

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
    // Inline styles, so an explicit size always beats the fill-the-container
    // rule in the stylesheet regardless of style injection order.
    '[style.width]': 'sizeValue()',
    '[style.height]': 'sizeValue()',
  },
})
export class UniIconComponent {
  private themeService = inject(ThemeService);

  color = input<ColorToken>();
  name = input.required<IconName>();

  /**
   * Explicit square size. Bare numbers are px; strings pass through, so any CSS
   * length works (`'1.25rem'`, `'1em'`, `'clamp(…)'`).
   *
   * Leave it unset to keep the default behaviour — the icon fills its
   * container, which is what lets a themed control size its own glyph through
   * padding. Set it at call sites that would otherwise need a width/height
   * rule just to size one icon.
   */
  size = input<CssLength>();

  /** Resolved from the theme's icon primitives; unknown names render nothing. */
  protected readonly path = computed(() => {
    const icon = this.themeService.theme().icons[this.name()];
    return icon ? `url("${icon}")` : 'none';
  });

  /** `null` leaves the styles off entirely, falling back to the stylesheet. */
  protected readonly sizeValue = computed(() => {
    const size = this.size();
    if (size === undefined || size === null || size === '') return null;
    if (typeof size === 'number') return `${size}px`;

    // A static attribute (`size="24"`) arrives as a string, so a bare number
    // has to mean px here too — otherwise it emits the invalid `width: 24`,
    // which the browser drops, silently falling back to filling the container.
    const trimmed = size.trim();
    return /^-?\d*\.?\d+$/.test(trimmed) ? `${trimmed}px` : trimmed;
  });

  protected readonly className = computed(() =>
    css([{ ...this.themeService.color(this.color()) }])
  );
}
