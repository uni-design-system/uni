import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
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

  /** A `[dialog-title]` in the projection, which then carries the id instead of the block. */
  protected readonly markedTitle = contentChild(UniDialogTitleDirective);

  constructor() {
    super();
    this.dialog?.hasTitle.set(true);
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
