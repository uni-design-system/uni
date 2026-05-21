import { Component, input } from '@angular/core';
import { UniBoxComponent } from '../box/box.component';
import type {
  OptionalAlignItems,
  OptionalDisplay,
  OptionalJustifyContent,
} from '@uni-design-system/uni-core';

@Component({
  selector: 'div[uni-center-layout], div[center-layout]',
  standalone: true,
  imports: [],
  template: `<ng-content></ng-content>`,
})
export class UniCenterComponent extends UniBoxComponent {
  override display = input<OptionalDisplay>('flex');
  override justifyContent = input<OptionalJustifyContent>('center');
  override alignItems = input<OptionalAlignItems>('center');

  constructor() {
    super();
  }
}
