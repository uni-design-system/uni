/**
 * Decides whether a click on a modal `<dialog>` was a click on its
 * `::backdrop` — shared by `dialog[uni-dialog]` and `uni-drawer` (`over`), so
 * the rule cannot drift between the two again.
 *
 * The click's target alone cannot tell. A `click` is dispatched to the nearest
 * common ancestor of the press and the release, and the `::backdrop` belongs
 * to the `<dialog>`: a text selection that starts in a field and is released
 * over the scrim therefore produces a click whose target *is* the `<dialog>`,
 * and used to close the surface — taking the user's unsaved input with it.
 * Only where the press began separates the two, so a backdrop click is one
 * that was both pressed and clicked on the dialog itself.
 *
 * Both checks compare against `currentTarget` rather than `nodeName`, so a
 * nested `<dialog>` in projected content never counts as this one's backdrop.
 *
 * ```ts
 * readonly backdrop = new BackdropDismiss();
 * // (pointerdown)="backdrop.press($event)"
 * // (click)="backdrop.isBackdropClick($event) && close()"
 * ```
 */
export class BackdropDismiss {
  private pressedOnBackdrop = false;

  /** Record where the press began. `pointerdown` covers mouse, touch and pen. */
  press(event: Event): void {
    this.pressedOnBackdrop = event.target === event.currentTarget;
  }

  /** True only when both the press and the click landed on the dialog itself. */
  isBackdropClick(event: Event): boolean {
    const onBackdrop = this.pressedOnBackdrop && event.target === event.currentTarget;
    this.pressedOnBackdrop = false;
    return onBackdrop;
  }
}
