import { Component, HostBinding, input, Input } from '@angular/core';
import { css } from '@emotion/css';

import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import type { UniBadgeOptions } from './badge.model';
import type { Variant } from '@uni-design-system/uni-core';

@Component({
  selector: 'div[uni-badge], Badge',
  standalone: true,
  imports: [],
  template: `<ng-content></ng-content>`,
  providers: [{ provide: COMPONENT_NAME, useValue: 'badge' }],
})
export class UniBadgeComponent extends BaseComponent<UniBadgeOptions> {
  color = input<Variant | undefined>(undefined);
  useVariant = input<boolean>(false);

  @Input() width?: number;

  @HostBinding('class') get className() {
    const color = this.color();

    return css([
      {
        ...this.theme.getContainerColors(color || 'primary', this.useVariant()),
        ...this.theme.typeface('badge'),
        display: 'inline-block',
        padding: '0 16px',
        ...this.theme.radius(this.componentOptions().borderRadius),
        textAlign: 'center',
        letterSpacing: 1,
      },
      this.width && {
        minWidth: this.width - 32,
      },
    ]);
  }
}
