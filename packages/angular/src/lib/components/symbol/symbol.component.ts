import { Component, HostBinding, input, Input } from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent } from '../base';
import type { SymbolFill, SymbolGrade, SymbolOptions, SymbolWeight } from './symbol.model';
import { COMPONENT_NAME } from '../base/base.component';

@Component({
  selector: 'uni-symbol, Symbol',
  standalone: true,
  imports: [],
  template: `{{ name() }}`,
  providers: [{ provide: COMPONENT_NAME, useValue: 'symbol' }],
})
export class UniSymbolComponent extends BaseComponent<SymbolOptions> {
  name = input.required<string>();

  fill = input<SymbolFill>();
  weight = input<SymbolWeight>();
  grade = input<SymbolGrade>();
  opticalSize = input<number>();

  @HostBinding('class') get className() {
    const settings =
      `'FILL' ${this.fill() || this.componentOptions().fill || 0}, ` +
      `'wght' ${this.weight() || this.componentOptions().weight || 400}, ` +
      `'GRAD' ${this.grade() || this.componentOptions().grade || 0}, ` +
      `'opsz' ${this.opticalSize() || this.componentOptions().opticalSize || 24}`;

    return (
      'material-symbols-rounded ' +
      css({
        fontVariationSettings: settings,
        fontSize: `${this.opticalSize() || this.componentOptions().opticalSize || 24}px`,
      })
    );
  }
}
