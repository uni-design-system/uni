import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { css, keyframes } from '@emotion/css';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniIconButtonComponent } from '../icon-button';
import type { UniDialogOptions } from './dialog.model';
import { fadeIn, fadeOut } from '@uni-design-system/uni-core';
import { uniqueId } from '../../cdk';

@Component({
  selector: 'dialog[uni-dialog], Dialog',
  imports: [UniIconButtonComponent, CommonModule],
  template: `
    @if (defaultCloseButton()) {
      <button
        icon-button
        iconName="close"
        variant="ghost"
        (click)="close()"
        [class]="closeButton"
        size="md"
      >
        Close
      </button>
    }
    <ng-content></ng-content>
  `,
  providers: [{ provide: COMPONENT_NAME, useValue: 'dialog' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-labelledby]': 'hasTitle() ? titleId : null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[class]': 'className()',
    '(click)': 'backdropClick($event)',
    '(cancel)': 'escapeCancel($event)',
    '(animationend)': 'closingAnimation($event)',
  },
})
export class UniDialogComponent extends BaseComponent<UniDialogOptions> {
  private elem = inject(ElementRef);

  /** Two-way bindable open state: [(show)]. */
  show = model<boolean>(false);

  /**
   * Accessible name for dialogs without a DialogHeader. When a DialogHeader
   * is present it labels the dialog automatically via aria-labelledby.
   */
  ariaLabel = input<string>();

  /**
   * CSS selector for the element to focus when the dialog opens. Defaults to
   * the browser's native behavior (first focusable element).
   */
  initialFocus = input<string>();

  defaultCloseButton = input<boolean>();

  /** Id referenced by aria-labelledby; DialogHeader attaches it to the title. */
  readonly titleId = uniqueId('uni-dialog-title');
  readonly hasTitle = signal(false);

  /** Emits true once opened and false once the closing animation finishes. */
  showing = output<boolean>();

  constructor() {
    super();
    effect(() => (this.show() ? this.open() : this.close()));
  }

  private get _dialog(): HTMLDialogElement {
    return this.elem.nativeElement;
  }

  protected readonly className = computed(() =>
    css([
      {
        ...this.theme.radius(this.componentOptions().borderRadius),
        ...this.theme.colorPair(this.componentOptions().color),
        ...this.theme.border(this.componentOptions().border),
        ...this.theme.boxShadow(this.componentOptions().elevation),
        ...this.theme.padding(this.componentOptions().padding || 'none'),

        '&::backdrop': {
          ...this.componentOptions().backdrop,
        },

        '&[open], &::backdrop': {
          animation: `${this.dialogFadeIn} ease-in 350ms`,
        },

        '&[closing], &[closing]::backdrop': {
          animation: `${this.dialogFadeOut} ease-in 350ms`,
        },
      },
    ])
  );

  protected backdropClick(event: Event) {
    if ((event.target as HTMLElement).nodeName === 'DIALOG') {
      this.close();
    }
  }

  /**
   * Escape fires the native 'cancel' event, which would close the dialog
   * instantly and leave our show-state out of sync. Route it through the
   * animated close() instead.
   */
  protected escapeCancel(event: Event) {
    event.preventDefault();
    this.close();
  }

  protected closingAnimation(e: AnimationEvent) {
    // Close the dialog if the animation is finished
    if (e.animationName.includes(this.dialogFadeOut)) {
      this._dialog.close();
      this._dialog.removeAttribute('closing');
      this.showing.emit(false);
    }
  }

  closeButton = css({
    position: 'absolute',
    right: 12,
    top: 12,
  });

  private dialogFadeIn = keyframes({ ...fadeIn });
  private dialogFadeOut = keyframes({ ...fadeOut });

  open() {
    if (this._dialog.open) return;

    this._dialog.removeAttribute('closing');
    this._dialog.showModal();

    // Native showModal focuses the first focusable element; allow consumers
    // to direct initial focus somewhere more useful (e.g. past the close
    // button, onto a primary action or first form field).
    const selector = this.initialFocus();
    if (selector) {
      this._dialog.querySelector<HTMLElement>(selector)?.focus();
    }

    this.show.set(true);
    this.showing.emit(true);
  }

  close() {
    // Strict check: outside a real <dialog> host (e.g. unit tests) `open`
    // is undefined and close() should still run.
    if (this._dialog.open === false) return;

    this._dialog.setAttribute('closing', 'true');
    this.show.set(false);
  }
}
