import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, HostBinding, inject, input, TemplateRef } from '@angular/core';
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
  selector: 'div[oui-menu-item], div[menu-item]',
  standalone: true,
  imports: [UniTextComponent, UniSymbolComponent, UniBoxComponent, NgTemplateOutlet],
  templateUrl: './menu-item.component.html',
  styles: [
    `
      :host:focus {
        background: #ccc;
        color: #fff;
      }

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

  @HostBinding('class') get className() {
    return css([
      {
        cursor: 'pointer',
        transition: 'all 0.35s ease',
        height: 38,

        '&:hover': {
          ...this.theme.colorPair(this.hoverColor()),
        },
      },
    ]);
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }
}
