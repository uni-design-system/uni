import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  confirmation = input<Confirmation>();
  showing = output<boolean>();
}
