import { Directive, input } from '@angular/core';

import { UniBoxDirective } from '../box/box.directive';
import type { OptionalDisplay, OptionalWrap } from '@uni-design-system/uni-core';

@Directive({
  selector: '[uni-wrap-layout], [wrap-layout]',
})
export class UniWrapDirective extends UniBoxDirective {
  override display = input<OptionalDisplay>('flex');
  override wrapItems = input<OptionalWrap>('wrap');

  constructor() {
    super();
  }
}
