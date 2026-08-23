import { Directive, computed, input } from '@angular/core';
import { css } from '@emotion/css';

@Directive({
  selector: '[uni-grid-area-layout], [grid-area-layout]',
  host: { '[class]': 'className()' },
})
export class UniGridAreaDirective {
  area = input.required<string>();

  protected readonly className = computed(() => css({ gridArea: this.area() }));
}
