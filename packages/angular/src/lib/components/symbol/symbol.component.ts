import { Component, HostBinding, Input } from '@angular/core';
import { css } from '@emotion/css';

@Component({
  selector: 'uni-symbol, Symbol',
  standalone: true,
  imports: [],
  template: `{{ name }}`,
})
export class UniSymbolComponent {
  @Input() name!: string;

  @Input() fill: 1 | 0 = 0;
  @Input() weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 = 400;
  @Input() grade: -25 | 0 | 200 = 0;
  @Input() opticalSize = 24;

  @HostBinding('class') get className() {
    const settings = `'FILL' ${this.fill}, 'wght' ${this.weight}, 'GRAD' ${this.grade}, 'opsz' ${this.opticalSize}`;

    return (
      'material-symbols-rounded ' +
      css({
        fontVariationSettings: settings,
        fontSize: `${this.opticalSize}px`,
      })
    );
  }
}
