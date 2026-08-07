import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { css } from '@emotion/css';

import { UniBoxComponent } from '../../layout';
import { UniSymbolComponent } from '../../symbol';
import { ThemeService } from '../../../theming';
import type { ContainerColorToken, Variant } from '@uni-design-system/uni-core';
import type { UniMenuItemOptions } from './menu-item.model';

@Component({
  selector: '[uni-menu-item], [menu-item]',
  imports: [UniSymbolComponent, UniBoxComponent, NgTemplateOutlet],
  templateUrl: './menu-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menuitem',
    tabindex: '-1',
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
    '[attr.aria-current]': "active() ? 'true' : null",
    '[class]': 'menuItemClassName()',
  },
})
export class UniMenuItemComponent<T = any> {
  theme = inject(ThemeService);
  private _elementRef = inject(ElementRef);

  label = input<string>();
  template = input<TemplateRef<T>>();
  context = input<T>();
  symbolName = input<string>();
  active = input<boolean>();
  /** Tone routed through the theme's `menuItem` variants (e.g. 'warn'). */
  variant = input<Variant | undefined>();
  /** Per-instance override of the theme's `menuItem.hoverColor`. */
  hoverColor = input<ContainerColorToken | undefined>();
  disabled = input<boolean>(false);

  protected readonly options = computed(() =>
    this.theme.getComponentOptions<UniMenuItemOptions>('menuItem')()
  );

  protected readonly activeSymbol = computed(() => this.options().activeSymbol);

  /** Typography comes from the host's themed typeface; the span only lays out. */
  protected readonly LabelClassName = css({ display: 'block', whiteSpace: 'nowrap' });

  protected readonly menuItemClassName = computed(() => {
    const options = this.options();
    const variant = this.variant();
    const variantStyle = variant
      ? this.theme.component('menuItem')().variants?.[variant]
      : undefined;
    const transitionSpeed = options.transitionSpeed ?? 0;

    return css([
      {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
        height: options.height,
        ...this.theme.horizontalPadding(options.paddingHorizontal),
        ...this.theme.gap(options.gap),
        ...this.theme.radius(options.borderRadius),
        ...this.theme.typeface(options.typeface),
        ...this.theme.color(options.textColor),

        // Roving focus highlights items the same way hover does
        '&:hover, &:focus': {
          ...this.theme.colorPair(this.hoverColor() ?? options.hoverColor),
          outline: 'none',
        },

        '&[aria-disabled="true"]': {
          color: this.theme.colors()['on-disabled-surface'],
          pointerEvents: 'none',
        },
      },
      transitionSpeed > 0 && { transition: `all ${transitionSpeed}s ease` },
      // Variant tones override the base look; a same-key '&:hover, &:focus'
      // in the variant replaces the default hover pair outright.
      { ...variantStyle },
    ]);
  });

  /** Host element, used by Menu for roving-focus bookkeeping. */
  get host(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }
}
