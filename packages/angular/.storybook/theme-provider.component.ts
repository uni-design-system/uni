import { Component, effect, inject, input, untracked } from '@angular/core';
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
    // On mount, an active custom brand theme (rehydrated from the Theme
    // Builder's palette) wins over the toolbar default — stamping the toolbar
    // theme here persisted it and silently clobbered the brand theme on every
    // story navigation. Toolbar *changes* still apply normally.
    let firstRun = true;
    effect(() => {
      const themeKey = this.uniTheme();
      const keepCustom = firstRun && untracked(() => this.theme.isCustomTheme());
      firstRun = false;
      if (themeKey && !keepCustom) this.theme.selectTheme(themeKey);
    });
  }
}
