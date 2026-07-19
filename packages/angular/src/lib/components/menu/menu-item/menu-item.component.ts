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
import { UniTextComponent } from '../../text';
import { UniSymbolComponent } from '../../symbol';
import type {
  ContainerColorToken,
  OptionalAlignItems,
  OptionalDisplay,
  OptionalFlexDirection,
  OptionalSize,
} from '@uni-design-system/uni-core';

@Component({
  selector: 'div[uni-menu-item], div[menu-item]',
  imports: [UniTextComponent, UniSymbolComponent, UniBoxComponent, NgTemplateOutlet],
  templateUrl: './menu-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menuitem',
    tabindex: '-1',
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
    '[attr.aria-current]': "active() ? 'true' : null",
    '[class]': 'menuItemClassName()',
  },
  styles: [
    `
      :host.disabled {
        color: #ddd;
        pointer-events: none;
      }
    `,
  ],
})
export class UniMenuItemComponent<T = any> extends UniBoxComponent {
  private _elementRef = inject(ElementRef);

  override display = input<OptionalDisplay>('flex');
  override flexDirection = input<OptionalFlexDirection>('row');
  override alignItems = input<OptionalAlignItems>('center');
  override paddingHorizontal = input<OptionalSize>('md');
  override gap = input<OptionalSize>('md');

  label = input<string>();
  template = input<TemplateRef<T>>();
  context = input<T>();
  symbolName = input<string>();
  active = input<boolean>();
  hoverColor = input<ContainerColorToken>('primary-container');
  disabled = input<boolean>(false);

  protected readonly menuItemClassName = computed(() =>
    css([
      {
        cursor: 'pointer',
        transition: 'all 0.35s ease',
        height: 38,

        // Roving focus highlights items the same way hover does
        '&:hover, &:focus': {
          ...this.theme.colorPair(this.hoverColor()),
          outline: 'none',
        },
      },
    ])
  );

  /** Host element, used by Menu for roving-focus bookkeeping. */
  get host(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }
}
