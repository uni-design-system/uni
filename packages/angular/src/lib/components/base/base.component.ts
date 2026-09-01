import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  InjectionToken,
  input,
} from '@angular/core';
import type { ComponentName, Size, Variant } from '@uni-design-system/uni-core';
import { ThemeService } from '../../theming';

export const COMPONENT_NAME = new InjectionToken<ComponentName>('');

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: ``,
})
// `V` defaults to `unknown` alongside `T`: passing the class as a value erases
// its parameters to `unknown`, so an `object` default made
// `TestBed.createComponent(BaseComponent)` disagree with `ComponentFixture<BaseComponent>`.
export class BaseComponent<T = unknown, V = unknown> {
  protected componentName = inject(COMPONENT_NAME);
  theme = inject(ThemeService);

  variant = input<Variant>('primary'); // TODO: Make Variant support undefined
  size = input<Size>('lg');

  componentTheme = computed(() => this.theme.getComponentTheme<T, V>(this.componentName)());

  /**
   * The active variant's roles from the theme's `variantOptions` map, for
   * components whose accent lands on several interior elements and so cannot
   * be expressed as a single applied style. Undefined when the theme does not
   * define this variant — which also raises a dev warning.
   */
  variantRoles = computed(() => this.theme.variantRoles<V>(this.componentName, this.variant())());

  componentOptions = computed(() => this.theme.getComponentOptions<T>(this.componentName)());

  style = computed(() =>
    this.theme.componentStyle(this.componentName, this.variant(), this.size())()
  );
}
