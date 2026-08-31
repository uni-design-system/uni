import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { css } from '@emotion/css';
import { UniButtonComponent } from '../../button';
import { UniRowDirective } from '../../layout';
import { BaseComponent, COMPONENT_NAME } from '../../base/base.component';
import type { JustifyContent, NullableSize, Size, Variant } from '@uni-design-system/uni-core';
import { DRAWER_PANEL } from '../drawer.model';
import type { UniDrawerButtonsOptions } from './drawer-buttons.model';

/**
 * The drawer's pinned footer action row — the save bar of an editor panel.
 *
 * Sits outside the scrolling body, so the actions stay reachable however long
 * the form is. Mirrors `[dialog-buttons]`; the difference is posture, which
 * lives in the `drawerButtons` theme options rather than here.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: '[uni-drawer-buttons], [drawer-buttons]',
  imports: [UniRowDirective, UniButtonComponent],
  templateUrl: './drawer-buttons.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'drawerButtons' }],
  host: { '[class]': 'hostClass()' },
})
export class UniDrawerButtonsComponent extends BaseComponent<UniDrawerButtonsOptions> {
  private readonly drawer = inject(DRAWER_PANEL, { optional: true });

  confirmButtonText = input<string>();
  confirmButtonVariant = input<Variant>();
  cancelButtonText = input<string>();
  cancelButtonVariant = input<Variant>();
  disableConfirm = input<boolean>();
  padding = input<NullableSize>();
  justifyContent = input<JustifyContent>();

  confirmed = output();

  // Inputs win over theme options; the trailing literal is the fallback.
  protected confirmVariant = computed(
    () => this.confirmButtonVariant() ?? this.componentOptions().confirmButtonVariant ?? 'primary'
  );
  protected cancelVariant = computed(
    () => this.cancelButtonVariant() ?? this.componentOptions().cancelButtonVariant ?? 'quaternary'
  );
  protected paddingValue = computed(() => this.padding() ?? this.componentOptions().padding ?? 'md');
  protected justifyContentValue = computed(
    () => this.justifyContent() ?? this.componentOptions().justifyContent ?? 'flex-end'
  );
  protected gapValue = computed(() => this.componentOptions().gap ?? 'sm');
  protected buttonSize = computed<Size>(() => this.componentOptions().buttonSize ?? 'md');

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

  /**
   * Cancel routes through the drawer's own close decision, so a panel with
   * unsaved changes can veto it exactly as it vetoes Escape.
   */
  protected closeDrawer(): void {
    this.drawer?.requestClose('close-button');
  }
}
