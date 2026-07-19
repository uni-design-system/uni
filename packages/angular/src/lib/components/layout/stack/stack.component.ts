import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UniBoxComponent } from '../box/box.component';
import type { OptionalDisplay, OptionalFlexDirection } from '@uni-design-system/uni-core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'div[uni-stack-layout], Stack, div[stack-layout]',
  template: `<ng-content></ng-content>`,
})
export class UniStackComponent extends UniBoxComponent {
  override display = input<OptionalDisplay>('flex');
  override flexDirection = input<OptionalFlexDirection>('column');
  override minHeight = input<number | string | undefined>('fit-content');

  constructor() {
    super();
  }
}
