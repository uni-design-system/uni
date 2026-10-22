import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { css } from '@emotion/css';
import { UniButtonComponent } from '../../button';
import { UniRowDirective } from '../../layout';
import { BaseComponent, COMPONENT_NAME } from '../../base/base.component';
import { UniDialogComponent } from '../dialog.component';
import type { JustifyContent, NullableSize, Size, Variant } from '@uni-design-system/uni-core';
import type { UniDialogButtonsOptions } from './dialog-buttons.model';

/**
 * The dialog's pinned footer action row.
 *
 * Empty, it renders a Confirm/Cancel pair wired to the dialog. Project your
 * own buttons and they replace the pair while keeping the row's chrome —
 * padding, gap, justification, divider, `stretch` and `reverseOrder`. A
 * `[dialog-footnote]` projects on the leading edge, pushing the actions to
 * the trailing one.
 */
@Component({
  selector: '[uni-dialog-buttons], [dialog-buttons]',
  imports: [UniRowDirective, UniButtonComponent],
  templateUrl: './dialog-buttons.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'dialogButtons' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class UniDialogButtonsComponent extends BaseComponent<UniDialogButtonsOptions> {
  private dialog = inject(UniDialogComponent, {
    optional: true,
    host: true,
    skipSelf: true,
  });

  confirmButtonText = input<string>();
  confirmButtonVariant = input<Variant>();
  cancelButtonText = input<string>();
  cancelButtonVariant = input<Variant>();
  disableConfirm = input<boolean>();
  /**
   * Whether Confirm closes the dialog as it emits `confirmed`. On by default.
   * Off, the caller closes when its save resolves — a dialog that confirms
   * asynchronously stays open with its error when the save fails.
   */
  closeOnConfirm = input(true, { transform: booleanAttribute });
  /** Passed to the Confirm button: a spinner, and no second click. */
  loading = input(false, { transform: booleanAttribute });
  padding = input<NullableSize>();
  paddingBottom = input<NullableSize>();
  justifyContent = input<JustifyContent>();

  confirmed = output();

  // Inputs win over theme options; the trailing literal is the legacy default.
  protected confirmVariant = computed(
    () => this.confirmButtonVariant() ?? this.componentOptions().confirmButtonVariant ?? 'primary'
  );
  protected cancelVariant = computed(
    () => this.cancelButtonVariant() ?? this.componentOptions().cancelButtonVariant ?? 'warn'
  );
  protected paddingValue = computed(() => this.padding() ?? this.componentOptions().padding ?? 'md');
  protected paddingBottomValue = computed(
    () => this.paddingBottom() ?? this.componentOptions().paddingBottom ?? 'lg'
  );
  protected justifyContentValue = computed(
    () => this.justifyContent() ?? this.componentOptions().justifyContent ?? 'center'
  );
  protected gapValue = computed(() => this.componentOptions().gap ?? 'md');
  protected buttonSize = computed<Size>(() => this.componentOptions().buttonSize ?? 'lg');

  /**
   * The footnote cell: takes the leading edge and the slack, so the actions
   * sit at the trailing one. Collapses when nothing was projected, so a row
   * without a footnote renders exactly as it did. `order` keeps it leading
   * under `reverseOrder`, which flips the row.
   */
  protected readonly footnoteClass = computed(() =>
    css({
      flex: '1 1 auto',
      minWidth: 0,
      order: this.componentOptions().reverseOrder ? 1 : -1,
      '&:empty': { display: 'none' },
    })
  );

  /** A pinned row, sized by its content rather than by the body beside it. */
  protected readonly hostClass = computed(() =>
    css({
      flex: 'none',
      ...this.theme.borderTop(this.componentOptions().divider),
    })
  );

  protected readonly className = computed(() =>
    css([
      this.componentTheme().fixed,
      this.componentOptions().stretch && {
        width: '100%',
        minWidth: '100%',
        '& > button': { flex: '1 1 50%', maxWidth: '50%' },
      },
    ])
  );

  protected onConfirm(): void {
    this.confirmed.emit();
    if (this.closeOnConfirm()) this.closeDialog();
  }

  closeDialog() {
    this.dialog?.close();
  }
}
