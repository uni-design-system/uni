import { Component, HostBinding, inject, input } from '@angular/core';
import { css } from '@emotion/css';

import type {
  ColorKey,
  OptionalDisplay,
  OptionalTextAlign,
  Typeface,
} from '@uni-design-system/uni-core';
import { ThemeService } from '../../theming/theme.service';

@Component({
  selector: 'uni-text, Text',
  standalone: true,
  imports: [],
  template: '<ng-content></ng-content>',
})
export class UniTextComponent {
  theme = inject(ThemeService);

  typeface = input<Typeface>('title-small');
  color = input<ColorKey>();
  display = input<OptionalDisplay>();
  align = input<OptionalTextAlign>();
  nowrap = input<boolean>(false);
  maxWidth = input<number>();
  ellipsis = input<boolean>(false);

  @HostBinding('class') get className() {
    return css([
      {
        ...this.theme.typeface(this.typeface()),
        ...this.theme.color(this.color()),
        display: this.display(),
      },
      this.align() && {
        textAlign: this.align(),
      },
      this.nowrap() && {
        whiteSpace: 'nowrap',
      },
      this.maxWidth() && {
        maxWidth: this.maxWidth(),
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'inline-block',
      },
      this.ellipsis() && {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0,
      },
    ]);
  }
}
