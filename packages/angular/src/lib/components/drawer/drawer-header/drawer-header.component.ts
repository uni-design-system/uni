import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../../base/base.component';
import { UniIconButtonComponent } from '../../icon-button';
import { UniBoxDirective, UniRowDirective } from '../../layout';
import { UniTextDirective } from '../../text';
import { DRAWER_PANEL } from '../drawer.model';
import type { UniDrawerHeaderOptions } from './drawer-header.model';

/**
 * The drawer's pinned header row: a title, and optionally a close button.
 *
 * Sits outside the scrolling body, so it stays put while the form beneath it
 * moves. Reached either by projecting it — `<div uni-drawer-header>` — or
 * implicitly, by giving `uni-drawer` a `headline`, in which case the drawer
 * renders one of these itself.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: '[uni-drawer-header]',
  imports: [UniBoxDirective, UniIconButtonComponent, UniTextDirective, UniRowDirective],
  templateUrl: './drawer-header.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'drawerHeader' }],
  host: { '[class]': 'className()' },
})
export class UniDrawerHeaderComponent extends BaseComponent<UniDrawerHeaderOptions> {
  private readonly drawer = inject(DRAWER_PANEL, { optional: true });

  /** Title text. Falls back to the drawer's `headline`; projected content wins over both. */
  headline = input<string>();

  /** Attached to the title so the drawer is labelled by it. */
  protected readonly titleId = this.drawer?.titleId ?? null;

  protected readonly title = computed(() => this.headline() ?? this.drawer?.headline() ?? '');

  protected readonly showClose = computed(() => this.drawer?.defaultCloseButton() ?? true);

  constructor() {
    super();
    // Tells the drawer it is labelled by this row rather than by `ariaLabel`.
    this.drawer?.hasHeader.set(true);
  }

  /** Never a bare close: the drawer decides, so a veto is honoured here too. */
  protected closeDrawer(): void {
    this.drawer?.requestClose('close-button');
  }

  protected readonly className = computed(() =>
    css({
      // A pinned row: it is a flex child of the panel and must not be sized
      // by the scrolling body beside it.
      flex: 'none',
      ...this.theme.borderBottom(this.componentOptions().divider),
    })
  );
}
