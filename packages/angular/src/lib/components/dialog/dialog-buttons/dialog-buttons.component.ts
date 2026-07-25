import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { css } from '@emotion/css';
import { UniButtonComponent } from '../../button';
import { UniRowComponent } from '../../layout';
import { BaseComponent, COMPONENT_NAME } from '../../base/base.component';
import { UniDialogComponent } from '../dialog.component';
import type { JustifyContent, NullableSize, Size, Variant } from '@uni-design-system/uni-core';
import type { UniDialogButtonsOptions } from './dialog-buttons.model';

@Component({
  selector: '[uni-dialog-buttons], [dialog-buttons]',
  imports: [UniRowComponent, UniButtonComponent],
  templateUrl: './dialog-buttons.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'dialogButtons' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  closeDialog() {
    this.dialog?.close();
  }
}
