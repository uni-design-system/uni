import { Component, HostBinding, inject, input, Input } from '@angular/core';
import { css } from '@emotion/css';

import type {
  ColorKey,
  OptionalDisplay,
  OptionalTextAlign,
  Typeface,
} from '@uni-design-system/uni-core';
import { ThemeService } from '../../theming/theme.service';

@Component({
  selector: 'oui-text, Text',
  standalone: true,
  imports: [],
  template: '<ng-content></ng-content>',
})
export class UniTextComponent {
  theme = inject(ThemeService);

  role = input<Typeface>('title-small');
  color = input<ColorKey>();
  display = input<OptionalDisplay>();
  @Input() align?: OptionalTextAlign;
  @Input() nowrap?: boolean;
  @Input() maxWidth?: number;
  @Input() ellipsis?: boolean;

  @HostBinding('class') get className() {
    return css([
      {
        ...this.theme.typeface(this.role()),
        ...this.theme.color(this.color()),
        display: this.display(),
      },
      this.align && {
        textAlign: this.align,
      },
      this.nowrap && {
        whiteSpace: 'nowrap',
      },
      this.maxWidth && {
        maxWidth: this.maxWidth,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'inline-block',
      },
      this.ellipsis && {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0,
      },
    ]);
  }
}
