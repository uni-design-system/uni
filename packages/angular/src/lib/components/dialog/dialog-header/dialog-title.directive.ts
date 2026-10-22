import { Directive, inject } from '@angular/core';
import { UniDialogComponent } from '../dialog.component';

/**
 * Marks the element that names the dialog inside a rich `[dialog-header]`.
 *
 * A rich head projects an eyebrow, a headline and a blurb; the dialog should
 * be labelled by the headline alone, not read all three as its name. Put this
 * on the headline and it carries the id the dialog's `aria-labelledby` points
 * at. Without one, the whole projected block is the label.
 */
@Directive({
  selector: '[uni-dialog-title], [dialog-title]',
  host: { '[attr.id]': 'id' },
})
export class UniDialogTitleDirective {
  private readonly dialog = inject(UniDialogComponent, { optional: true });

  /** The dialog's title id, or null outside a dialog. */
  readonly id = this.dialog?.titleId ?? null;

  constructor() {
    this.dialog?.hasTitle.set(true);
  }
}
