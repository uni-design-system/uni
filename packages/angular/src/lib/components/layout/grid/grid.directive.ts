import { Directive, computed, input } from '@angular/core';
import { css } from '@emotion/css';

import { UniBoxDirective } from '../box/box.directive';
import type { OptionalDisplay, Thickness, Variant } from '@uni-design-system/uni-core';

@Directive({
  selector: '[uni-grid-layout], [grid-layout]',
  host: { '[class]': 'gridClassName()' },
})
export class UniGridDirective extends UniBoxDirective {
  override display = input<OptionalDisplay>('grid');

  templateAreas = input<string>();
  templateColumns = input<string>();
  templateRows = input<string>();
  outline = input<Thickness>();
  outlineColor = input<Variant>();

  protected readonly gridClassName = computed(() =>
    css([
      this.templateAreas() && {
        gridTemplateAreas: this.templateAreas(),
      },
      this.templateColumns() && {
        gridTemplateColumns: this.templateColumns(),
      },
      this.templateRows() && {
        gridTemplateRows: this.templateRows(),
      },
      this.outline() && {
        gap: this.theme.getThickness(this.outline()!),
      },
      this.outlineColor() && {
        backgroundColor: this.theme.colorPalette()[this.outlineColor()!],
      },
    ])
  );
}
