import { Component, effect, inject, input } from '@angular/core';
import { ThemeService } from '../src/lib/theming';

/**
 * Storybook-only wrapper: applies the theme chosen in the toolbar (the
 * `uniTheme` global) through ThemeService. Used via componentWrapperDecorator
 * in preview.ts, so every story re-themes live without re-bootstrapping.
 */
@Component({
  selector: 'sb-uni-theme',
  template: '<ng-content />',
})
export class SbUniThemeComponent {
  private theme = inject(ThemeService);

  uniTheme = input<string>();

  constructor() {
    effect(() => {
      const themeKey = this.uniTheme();
      if (themeKey) this.theme.selectTheme(themeKey);
    });
  }
}
