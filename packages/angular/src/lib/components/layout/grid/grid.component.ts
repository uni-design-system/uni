import { Component, HostBinding, input, Input } from '@angular/core';
import { css } from '@emotion/css';

import { UniBoxComponent } from '../box/box.component';
import type { OptionalDisplay, Thickness, Variant } from '@uni-design-system/uni-core';

@Component({
  selector: 'div[uni-grid-layout], Grid, div[grid-layout]',
  standalone: true,
  imports: [],
  template: `<ng-content></ng-content>`,
})
export class UniGridComponent extends UniBoxComponent {
  override display = input<OptionalDisplay>('grid');

  constructor() {
    super();
  }

  @Input() templateAreas?: string;
  @Input() templateColumns?: string;
  @Input() templateRows?: string;
  @Input() outline?: Thickness;
  @Input() outlineColor?: Variant;

  @HostBinding('class')
  get className() {
    return css([
      this.templateAreas && {
        gridTemplateAreas: this.templateAreas,
      },
      this.templateColumns && {
        gridTemplateColumns: this.templateColumns,
      },
      this.templateRows && {
        gridTemplateRows: this.templateRows,
      },
      this.outline && {
        gap: this.theme.getThickness(this.outline),
      },
      this.outlineColor && {
        backgroundColor: this.theme.colorPalette()[this.outlineColor],
      },
    ]);
  }
}
