import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import {
  UniDialogButtonsComponent,
  UniDialogComponent,
  UniDialogHeaderComponent,
} from '../../dialog';
import { UniBoxDirective } from '../../layout';
import { UniTextDirective } from '../../text';
import type { Confirmation } from '../../../cdk/notification';

@Component({
  selector: 'uni-confirmation-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UniDialogComponent,
    UniDialogHeaderComponent,
    UniBoxDirective,
    UniTextDirective,
    UniDialogButtonsComponent,
  ],
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  show = input(false);
  confirmation = input<Confirmation>();
  showing = output<boolean>();
}
