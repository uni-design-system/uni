import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UniBoxComponent } from '../box/box.component';
import type { OptionalDisplay, OptionalFlexDirection } from '@uni-design-system/uni-core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: '[uni-stack-layout], [stack-layout]',
  template: `<ng-content></ng-content>`,
})
export class UniStackComponent extends UniBoxComponent {
  override display = input<OptionalDisplay>('flex');
  override flexDirection = input<OptionalFlexDirection>('column');
  /**
   * Defaults to `fit-content` (guards content collapse). Set `[minHeight]="0"`
   * when the stack must shrink inside a constrained flex parent (scroll
   * containment).
   */
  override minHeight = input<number | string | undefined>('fit-content');

  constructor() {
    super();
  }
}
