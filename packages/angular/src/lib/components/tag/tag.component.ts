import { Component, input, output } from '@angular/core';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniBoxComponent, UniRowComponent } from '../layout';
import { UniTextComponent } from '../text/text.component';

@Component({
  selector: 'Tag, uni-tag',
  imports: [UniBoxComponent, UniIconButtonComponent, UniTextComponent, UniRowComponent],
  templateUrl: './tag.component.html',
})
export class UniTagComponent {
  label = input<string>();
  value = input<string | number>();

  close = output<string | number>();

  handleClose() {
    const v = this.value();
    if (v) this.close.emit(v);
  }
}
