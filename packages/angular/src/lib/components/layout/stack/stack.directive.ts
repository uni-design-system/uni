import { Directive, input } from '@angular/core';
import { UniBoxDirective } from '../box/box.directive';
import type { OptionalDisplay, OptionalFlexDirection } from '@uni-design-system/uni-core';

@Directive({
  selector: '[uni-stack-layout], [stack-layout]',
})
export class UniStackDirective extends UniBoxDirective {
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
