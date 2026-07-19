import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { UniButtonComponent } from '../../button';
import { UniRowComponent } from '../../layout';
import { UniDialogComponent } from '../dialog.component';
import type { JustifyContent, NullableSize, Variant } from '@uni-design-system/uni-core';

@Component({
  selector: 'uni-dialog-buttons, DialogButtons, div[dialog-buttons]',
  imports: [UniRowComponent, UniButtonComponent],
  templateUrl: './dialog-buttons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniDialogButtonsComponent {
  private dialog = inject(UniDialogComponent, {
    optional: true,
    host: true,
    skipSelf: true,
  });

  confirmButtonText = input<string>();
  confirmButtonVariant = input<Variant>('primary');
  cancelButtonText = input<string>();
  disableConfirm = input<boolean>();
  padding = input<NullableSize>('md');
  paddingBottom = input<NullableSize>('lg');
  justifyContent = input<JustifyContent>('center');

  confirmed = output();

  closeDialog() {
    this.dialog?.close();
  }
}
