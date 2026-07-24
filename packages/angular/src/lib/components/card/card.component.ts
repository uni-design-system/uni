import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniCardOptions } from './card.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-card, Card',
  imports: [],
  templateUrl: './card.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'card' }],
})
export class UniCardComponent extends BaseComponent<UniCardOptions> {
  /**
   * Token-resolved frame (variant-named border primitive, radii, elevation)
   * under the merged theme style, so hand-authored fixed/variant styles from
   * older themes keep winning.
   */
  protected readonly cardStyle = computed(() => ({
    ...this.theme.border(this.componentOptions().border ?? this.variant()),
    ...this.theme.radius(this.componentOptions().borderRadius),
    ...this.theme.boxShadow(this.componentOptions().elevation),
    ...this.style(),
  }));
}
