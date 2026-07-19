import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';

import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import type { UniBadgeOptions } from './badge.model';
import type { Variant } from '@uni-design-system/uni-core';

@Component({
  selector: 'div[uni-badge], Badge',
  imports: [],
  template: `<ng-content></ng-content>`,
  providers: [{ provide: COMPONENT_NAME, useValue: 'badge' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'className()' },
})
export class UniBadgeComponent extends BaseComponent<UniBadgeOptions> {
  color = input<Variant | undefined>(undefined);
  useVariant = input<boolean>(false);
  width = input<number>();

  protected readonly className = computed(() => {
    const width = this.width();

    return css([
      {
        ...this.theme.getContainerColors(this.color() || 'primary', this.useVariant()),
        ...this.theme.typeface('badge'),
        display: 'inline-block',
        padding: '0 16px',
        ...this.theme.radius(this.componentOptions().borderRadius),
        textAlign: 'center',
        letterSpacing: 1,
      },
      width !== undefined && {
        minWidth: width - 32,
      },
    ]);
  });
}
