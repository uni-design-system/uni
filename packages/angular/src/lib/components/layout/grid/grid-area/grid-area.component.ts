import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';

@Component({
  selector: '[uni-grid-area-layout], [grid-area-layout]',
  imports: [],
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'className()' },
})
export class UniGridAreaComponent {
  area = input.required<string>();

  protected readonly className = computed(() => css({ gridArea: this.area() }));
}
