import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UniBoxComponent } from '../box/box.component';
import type { OptionalDisplay, OptionalFlexDirection } from '@uni-design-system/uni-core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: '[uni-row-layout], [row-layout]',
  template: `<ng-content></ng-content>`,
})
export class UniRowComponent extends UniBoxComponent {
  override display = input<OptionalDisplay>('flex');
  override flexDirection = input<OptionalFlexDirection>('row');
  /**
   * Defaults to `fit-content` (guards content collapse). Set `[minWidth]="0"`
   * when the row must shrink inside a constrained flex parent (scroll or
   * text truncation containment).
   */
  override minWidth = input<number | string | undefined>('fit-content');

  constructor() {
    super();
  }
}
