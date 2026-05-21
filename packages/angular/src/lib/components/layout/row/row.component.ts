import { Component, input } from '@angular/core';
import { UniBoxComponent } from '../box/box.component';
import type { OptionalDisplay, OptionalFlexDirection } from '@uni-design-system/uni-core';

@Component({
  selector: 'div[uni-row-layout], Row, div[row-layout]',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class UniRowComponent extends UniBoxComponent {
  override display = input<OptionalDisplay>('flex');
  override flexDirection = input<OptionalFlexDirection>('row');
  override minWidth = input<number | string | undefined>('fit-content');

  constructor() {
    super();
  }
}
