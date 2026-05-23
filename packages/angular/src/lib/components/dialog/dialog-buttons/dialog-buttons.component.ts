import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UniButtonComponent } from '../../button';
import { UniRowComponent } from '../../layout';
import { UniDialogComponent } from '../dialog.component';
import type { JustifyContent, NullableSize, Variant } from '@uni-design-system/uni-core';

@Component({
  selector: 'uni-dialog-buttons, DialogButtons, div[dialog-buttons]',
  standalone: true,
  imports: [UniRowComponent, UniButtonComponent],
  templateUrl: './dialog-buttons.component.html',
})
export class UniDialogButtonsComponent {
  private dialog = inject(UniDialogComponent, {
    optional: true,
    host: true,
    skipSelf: true,
  });

  @Input() confirmButtonText?: string;
  @Input() confirmButtonVariant: Variant = 'primary';
  @Input() cancelButtonText?: string;
  @Input() disableConfirm?: boolean;
  @Input() padding?: NullableSize = 'md';
  @Input() paddingBottom?: NullableSize = 'lg';
  @Input() justifyContent?: JustifyContent = 'center';

  @Output() confirmed = new EventEmitter();

  closeDialog() {
    this.dialog?.close();
  }
}
