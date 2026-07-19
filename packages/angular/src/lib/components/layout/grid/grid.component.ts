import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';

import { UniBoxComponent } from '../box/box.component';
import type { OptionalDisplay, Thickness, Variant } from '@uni-design-system/uni-core';

@Component({
  selector: 'div[uni-grid-layout], Grid, div[grid-layout]',
  imports: [],
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'gridClassName()' },
})
export class UniGridComponent extends UniBoxComponent {
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
