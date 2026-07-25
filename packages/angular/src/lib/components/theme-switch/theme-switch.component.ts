import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { ThemeName } from '@uni-design-system/uni-core';
import { ThemeService } from '../../theming';
import { UniSelectComponent } from '../select-input';

/**
 * Drop-in switcher for the themes registered via `UNI_THEMES`: a select over
 * `ThemeService.themeOptions` that applies the choice through `selectTheme`
 * (so it persists across reloads like any other theme selection).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-theme-switch',
  imports: [UniSelectComponent],
  template: `
    <uni-select
      [options]="theme.themeOptions()"
      [value]="selected()"
      (valueChange)="select($event)"
      [ariaLabel]="ariaLabel()"
    />
  `,
})
export class UniThemeSwitchComponent {
  protected theme = inject(ThemeService);

  /** Accessible name for the underlying select. */
  ariaLabel = input('Theme');

  /** Emits the selected theme key after it has been applied. */
  themeChanged = output<ThemeName>();

  protected selected = computed<ThemeName | null>(() => this.theme.selectedThemeKey() || null);

  protected select(themeName: ThemeName | null): void {
    if (!themeName) return;
    this.theme.selectTheme(themeName);
    this.themeChanged.emit(themeName);
  }
}
