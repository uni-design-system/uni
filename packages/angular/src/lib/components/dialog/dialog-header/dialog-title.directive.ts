import { Directive, ElementRef, inject } from '@angular/core';
import { UniDialogComponent } from '../dialog.component';

/**
 * Marks the element that names the dialog inside a rich `[dialog-header]`.
 *
 * A rich head projects an eyebrow, a headline and a blurb; the dialog should
 * be labelled by the headline alone, not read all three as its name. Put this
 * on the headline and the dialog's `aria-labelledby` points at it — through
 * the id it already has, or the dialog's title id when it has none.
 *
 * Projected through a wrapper component the directive cannot reach the
 * dialog; the header then finds the marked element in the DOM instead.
 */
@Directive({
  selector: '[uni-dialog-title], [dialog-title]',
  host: { '[attr.id]': 'id' },
})
export class UniDialogTitleDirective {
  private readonly dialog = inject(UniDialogComponent, { optional: true });
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** The element's own id, else the dialog's title id; null outside a dialog. */
  readonly id = this.element.id || this.dialog?.titleId || null;

  constructor() {
    if (!this.dialog) return;
    this.dialog.hasTitle.set(true);
    this.dialog.titleIdOverride.set(this.id === this.dialog.titleId ? null : this.id);
  }
}
