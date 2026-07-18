import { Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';
import type { AbsoluteSize } from '@uni-design-system/uni-core';

@Component({
  selector: 'uni-json-view',
  imports: [],
  templateUrl: './json-view.component.html',
})
export class UniJsonViewComponent {
  json = input<unknown>();
  rows = input<number>(6);
  fontSize = input<AbsoluteSize | string>('medium');
  width = input<string | number>('100%');
  selectOnClick = input<boolean>(true);

  jsonString = computed(() => JSON.stringify(this.json(), null, 2));

  className = computed(() =>
    css({
      fontSize: this.fontSize(),
      width: this.width(),
    })
  );

  selectContents(jsonArea: HTMLTextAreaElement) {
    if (!this.selectOnClick()) return;
    jsonArea.select();
  }
}
