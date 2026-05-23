import { Component, EventEmitter, input, Input, Output } from '@angular/core';

import {
  UniDialogButtonsComponent,
  UniDialogComponent,
  UniDialogHeaderComponent,
} from '../../dialog';
import { UniBoxComponent } from '../../layout';
import { UniTextComponent } from '../../text';
import type { Confirmation } from '../../../cdk/notification';

@Component({
  selector: 'uni-confirmation-dialog, Confirmation',
  standalone: true,
  imports: [
    UniDialogComponent,
    UniDialogHeaderComponent,
    UniBoxComponent,
    UniTextComponent,
    UniDialogButtonsComponent,
  ],
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  show = input(false);
  @Input() confirmation?: Confirmation;
  @Output() showing = new EventEmitter();
}
