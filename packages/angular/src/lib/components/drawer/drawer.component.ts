import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  viewChild,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { css, keyframes } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { DrawerMode, DrawerPosition, UniDrawerOptions } from './drawer.model';

/**
 * Navigation drawer with two modes sharing one content slot:
 *
 * - `side` — an in-flow `<aside>` that pushes content (dashboard sidenav);
 *   opening/closing animates its width, and the divider border primitive
 *   separates it from the page.
 * - `over` — a native `<dialog>` in the top layer: focus trap, Escape and
 *   scrim backdrop come from the platform (same machinery as `uni-dialog`),
 *   sliding in from its edge.
 *
 * Surface, width, divider, elevation, padding and backdrop all resolve from
 * `drawer` theme tokens.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-drawer, Drawer',
  imports: [NgTemplateOutlet],
  providers: [{ provide: COMPONENT_NAME, useValue: 'drawer' }],
  template: `
    <ng-template #content><ng-content /></ng-template>
    @if (mode() === 'side') {
      <aside [class]="sideClass()" [attr.aria-hidden]="open() ? null : 'true'">
        <ng-container [ngTemplateOutlet]="contentTemplate()" />
      </aside>
    } @else {
      <dialog
        #overlay
        [class]="overClass()"
        [attr.aria-label]="ariaLabel()"
        (click)="onBackdropClick($event)"
        (cancel)="onCancel($event)"
        (animationend)="onAnimationEnd($event)"
      >
        <ng-container [ngTemplateOutlet]="contentTemplate()" />
      </dialog>
    }
  `,
})
export class UniDrawerComponent extends BaseComponent<UniDrawerOptions> {
  /** Two-way bindable open state: [(open)]. */
  readonly open = model(false);

  mode = input<DrawerMode>('side');
  position = input<DrawerPosition>('start');
  /** Accessible name for the overlay mode's dialog. */
  ariaLabel = input('Navigation');

  protected readonly contentTemplate = viewChild.required<TemplateRef<unknown>>('content');
  private readonly overlay = viewChild<ElementRef<HTMLDialogElement>>('overlay');

  constructor() {
    super();
    effect(() => {
      const dialog = this.overlay()?.nativeElement;
      if (!dialog) return;
      if (this.open()) {
        if (!dialog.open) {
          dialog.removeAttribute('closing');
          dialog.showModal();
        }
      } else if (dialog.open) {
        // Slide out first; the dialog closes when the animation reports done.
        dialog.setAttribute('closing', 'true');
      }
    });
  }

  protected onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).nodeName === 'DIALOG') this.open.set(false);
  }

  /** Route Escape through the animated close, keeping `open` in sync. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.open.set(false);
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    const dialog = this.overlay()?.nativeElement;
    if (!dialog || !dialog.hasAttribute('closing')) return;
    if (event.animationName.includes(this.slideOut())) {
      dialog.close();
      dialog.removeAttribute('closing');
    }
  }

  private readonly edge = computed(() => (this.position() === 'start' ? '-100%' : '100%'));

  private readonly slideIn = computed(() =>
    keyframes({ from: { transform: `translateX(${this.edge()})` }, to: { transform: 'translateX(0)' } })
  );
  private readonly slideOut = computed(() =>
    keyframes({ from: { transform: 'translateX(0)' }, to: { transform: `translateX(${this.edge()})` } })
  );

  protected readonly sideClass = computed(() => {
    const options = this.componentOptions();
    const width = options.width ?? 280;
    const start = this.position() === 'start';
    return css({
      display: 'block',
      boxSizing: 'border-box',
      height: '100%',
      flex: 'none',
      overflowX: 'hidden',
      overflowY: 'auto',
      transition: 'width 0.25s ease, visibility 0.25s',
      ...this.theme.colorPair(options.color),
      ...(start
        ? this.theme.borderRight(options.divider)
        : this.theme.borderLeft(options.divider)),
      ...(this.open()
        ? { width, visibility: 'visible', ...this.theme.padding(options.padding) }
        : { width: 0, visibility: 'hidden', padding: 0, border: 'none' }),
    });
  });

  protected readonly overClass = computed(() => {
    const options = this.componentOptions();
    const start = this.position() === 'start';
    return css({
      boxSizing: 'border-box',
      width: options.width ?? 280,
      maxWidth: '90vw',
      height: '100dvh',
      maxHeight: '100dvh',
      border: 'none',
      margin: start ? '0 auto 0 0' : '0 0 0 auto',
      overflowY: 'auto',
      ...this.theme.colorPair(options.color),
      ...this.theme.padding(options.padding),
      ...this.theme.boxShadow(options.elevation),
      '&::backdrop': { ...options.backdrop },
      '&[open]': { animation: `${this.slideIn()} 250ms ease-out` },
      '&[closing]': { animation: `${this.slideOut()} 250ms ease-in` },
    });
  });
}
