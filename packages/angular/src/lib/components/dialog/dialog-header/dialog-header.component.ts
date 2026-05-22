import { Component, inject } from '@angular/core';
import { BaseComponent } from '../../base';
import { COMPONENT_NAME } from '../../base/base.component';
import { UniIconButtonComponent } from '../../icon-button';
import { UniBoxComponent, UniRowComponent } from '../../layout';
import { UniTextComponent } from '../../text';
import { UniDialogComponent } from '../dialog.component';
import type { UniDialogHeaderOptions } from './dialog-header.model';

@Component({
  selector: 'div[oui-dialog-header], DialogHeader',
  standalone: true,
  imports: [UniBoxComponent, UniIconButtonComponent, UniTextComponent, UniRowComponent],
  templateUrl: './dialog-header.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'dialogHeader' }],
})
export class UniDialogHeaderComponent extends BaseComponent<UniDialogHeaderOptions> {
  private dialog = inject(UniDialogComponent, {
    optional: true,
    host: true,
    skipSelf: true,
  });

  closeDialog() {
    this.dialog?.close();
  }
}
