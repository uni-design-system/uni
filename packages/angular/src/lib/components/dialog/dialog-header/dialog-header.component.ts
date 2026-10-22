import {
  afterEveryRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { css } from '@emotion/css';
import { BaseComponent } from '../../base';
import { COMPONENT_NAME } from '../../base/base.component';
import { UniIconButtonComponent } from '../../icon-button';
import { UniBoxDirective, UniRowDirective } from '../../layout';
import { UniTextDirective } from '../../text';
import { UniDialogComponent } from '../dialog.component';
import type { UniDialogHeaderOptions } from './dialog-header.model';
import { UniDialogTitleDirective } from './dialog-title.directive';

/**
 * The dialog's pinned header row, in one of two shapes:
 *
 * - **Title bar** (default): one line of text, set in the theme's `textRole`
 *   and aligned by `textAlign`, beside a close button.
 * - **Rich** (`rich`): the projection is rendered as a block — an eyebrow, a
 *   headline, a blurb — beside the close button, in its own `richColor` and
 *   `richPadding`. Mark the headline `[dialog-title]` so it alone names the
 *   dialog.
 *
 * The close button follows the dialog's `defaultCloseButton`: a sheet that
 * closes from its footer says `[defaultCloseButton]="false"` once and gets no
 * X here either.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: '[uni-dialog-header], [dialog-header]',
  imports: [
    NgTemplateOutlet,
    UniBoxDirective,
    UniIconButtonComponent,
    UniTextDirective,
    UniRowDirective,
  ],
  templateUrl: './dialog-header.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'dialogHeader' }],
  host: { '[class]': 'className()' },
})
export class UniDialogHeaderComponent extends BaseComponent<UniDialogHeaderOptions> {
  private dialog = inject(UniDialogComponent, {
    optional: true,
    host: true,
    skipSelf: true,
  });

  /**
   * Render the projection as a block rather than one line of text. A sheet's
   * head — eyebrow, headline, blurb — has nowhere to go in a title bar.
   */
  rich = input(false, { transform: booleanAttribute });

  /** Attached to the title element so the parent dialog is labelled by it. */
  protected readonly titleId = this.dialog?.titleId ?? null;

  /**
   * A `[dialog-title]` in the projection, which then carries the id instead of
   * the block. The content query sees a title declared where the header is
   * used; the DOM query behind `hasMarkedTitle` also sees one projected
   * *through* a wrapper component's template, which a content query cannot.
   */
  protected readonly markedTitle = contentChild(UniDialogTitleDirective);
  private readonly hasMarkedTitle = signal(false);

  /** The rich block's id: the title id when the block is the dialog's name, else none. */
  protected readonly blockId = computed(() => {
    if (this.markedTitle() || this.hasMarkedTitle()) return null;
    return this.dialog?.ariaLabel() ? null : this.titleId;
  });

  /** Whether the header renders a close button — the dialog's `defaultCloseButton`, on unless said otherwise. */
  protected readonly showClose = computed(() => this.dialog?.defaultCloseButton() !== false);

  constructor() {
    super();
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const dialog = this.dialog;
    dialog?.hasTitle.set(true);

    // After every render, in rich mode: find a marked title wherever it came
    // from and give it the id; and decide who names the dialog. The block is
    // the name only for a bare dialog — a wrapper that passed `ariaLabel` has
    // already said what the right name is, and "eyebrow, headline, blurb, the
    // labels of every pinned field" is the wrong one every time. Every render
    // rather than a tracked effect, because the title arrives through content
    // projection, which no signal of this component observes; the signal
    // writes below are no-ops when nothing changed, so it cannot loop.
    afterEveryRender(() => {
      if (!this.rich()) {
        this.hasMarkedTitle.set(false);
        dialog?.hasTitle.set(true);
        dialog?.titleIdOverride.set(null);
        return;
      }
      const marked = host.querySelector<HTMLElement>('[uni-dialog-title], [dialog-title]');
      this.hasMarkedTitle.set(!!marked);
      if (!dialog) return;
      if (marked) {
        // Its own id names the dialog; only an id-less title takes ours.
        if (!marked.id) marked.id = dialog.titleId;
        dialog.titleIdOverride.set(marked.id === dialog.titleId ? null : marked.id);
        dialog.hasTitle.set(true);
      } else {
        dialog.titleIdOverride.set(null);
        dialog.hasTitle.set(!dialog.ariaLabel());
      }
    });
  }

  closeDialog() {
    this.dialog?.close();
  }

  /**
   * A pinned row: it is a flex child of the dialog and must not be sized by
   * the scrolling body beside it.
   */
  protected readonly className = computed(() =>
    css({
      flex: 'none',
      ...this.theme.borderBottom(this.componentOptions().divider),
    })
  );
}
