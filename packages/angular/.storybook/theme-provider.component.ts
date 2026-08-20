import { Component, effect, inject, input, OnInit } from '@angular/core';
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
export class SbUniThemeComponent implements OnInit {
  private theme = inject(ThemeService);

  uniTheme = input<string>();

  constructor() {
    // Toolbar *changes* after mount apply here. The first application happens
    // synchronously in ngOnInit instead — an effect only fires after the
    // initial render, which flashed the default theme (its palette, its
    // focus ring) for a frame on every story mount.
    let firstRun = true;
    effect(() => {
      const themeKey = this.uniTheme();
      if (firstRun) {
        firstRun = false;
        return;
      }
      if (themeKey) this.theme.selectTheme(themeKey);
    });
  }

  ngOnInit(): void {
    // On mount, an active custom brand theme (rehydrated from the Theme
    // Builder's palette) wins over the toolbar default — stamping the toolbar
    // theme here would persist it and silently clobber the brand theme on
    // every story navigation. Toolbar *changes* still apply normally.
    const themeKey = this.uniTheme();
    if (themeKey && !this.theme.isCustomTheme()) this.theme.selectTheme(themeKey);
  }
}
