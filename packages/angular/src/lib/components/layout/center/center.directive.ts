import { Directive, input } from '@angular/core';
import { UniBoxDirective } from '../box/box.directive';
import type {
  OptionalAlignItems,
  OptionalDisplay,
  OptionalJustifyContent,
} from '@uni-design-system/uni-core';

@Directive({
  selector: '[uni-center-layout], [center-layout]',
})
export class UniCenterDirective extends UniBoxDirective {
  override display = input<OptionalDisplay>('flex');
  override justifyContent = input<OptionalJustifyContent>('center');
  override alignItems = input<OptionalAlignItems>('center');

  constructor() {
    super();
  }
}
