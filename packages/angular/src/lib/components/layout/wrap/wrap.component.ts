import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { UniBoxComponent } from '../box/box.component';
import type { OptionalDisplay, OptionalWrap } from '@uni-design-system/uni-core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'div[uni-wrap-layout], Wrap, div[wrap-layout]',
  imports: [],
  template: `<ng-content></ng-content>`,
})
export class UniWrapComponent extends UniBoxComponent {
  override display = input<OptionalDisplay>('flex');
  override wrapItems = input<OptionalWrap>('wrap');

  constructor() {
    super();
  }
}
