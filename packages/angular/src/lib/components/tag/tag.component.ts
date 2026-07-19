import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniBoxComponent, UniRowComponent } from '../layout';
import { UniTextComponent } from '../text/text.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'Tag, uni-tag',
  imports: [UniBoxComponent, UniIconButtonComponent, UniTextComponent, UniRowComponent],
  templateUrl: './tag.component.html',
})
export class UniTagComponent {
  label = input<string>();
  value = input<string | number>();

  // TODO(v4): rename to closed — renaming is breaking
  // eslint-disable-next-line @angular-eslint/no-output-native
  close = output<string | number>();

  handleClose() {
    const v = this.value();
    if (v) this.close.emit(v);
  }
}
