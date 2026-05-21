import { Component, computed, inject, InjectionToken, input } from '@angular/core';
import type { ComponentName, Size, Variant } from '@uni-design-system/uni-core';
import { ThemeService } from '../../theming/theme.service';

export const COMPONENT_NAME = new InjectionToken<ComponentName>('');

@Component({
  standalone: true,
  imports: [],
  template: ``,
})
export class BaseComponent<T = unknown> {
  protected componentName = inject(COMPONENT_NAME);
  theme = inject(ThemeService);

  variant = input<Variant>('primary'); // TODO: Make Variant support undefined
  size = input<Size>('lg');

  componentTheme = computed(() => this.theme.getComponentTheme<T>(this.componentName)());

  componentOptions = computed(() => this.theme.getComponentOptions<T>(this.componentName)());

  style = computed(() =>
    this.theme.componentStyle(this.componentName, this.variant(), this.size())()
  );
}
