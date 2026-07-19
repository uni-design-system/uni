import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  input,
  Input,
  linkedSignal,
  Output,
  signal,
} from '@angular/core';
import { css, keyframes } from '@emotion/css';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniIconButtonComponent } from '../icon-button';
import type { UniDialogOptions } from './dialog.model';
import { fadeIn, fadeOut } from '@uni-design-system/uni-core';
import { uniqueId } from '../../cdk';

@Component({
  selector: 'dialog[uni-dialog], Dialog',
  standalone: true,
  imports: [UniIconButtonComponent, CommonModule],
  template: `
    @if (defaultCloseButton) {
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
  host: {
    '[attr.aria-labelledby]': 'hasTitle() ? titleId : null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
})
export class UniDialogComponent extends BaseComponent<UniDialogOptions> {
  private elem = inject(ElementRef);

  show = input<boolean>(false);
  private readonly _show = linkedSignal(() => this.show());

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

  /** Id referenced by aria-labelledby; DialogHeader attaches it to the title. */
  readonly titleId = uniqueId('uni-dialog-title');
  readonly hasTitle = signal(false);

  @Input() defaultCloseButton?: boolean;
  @Output() showing = new EventEmitter();

  constructor() {
    super();
    effect(() => (this._show() ? this.open() : this.close()));
  }

  private get _dialog(): HTMLDialogElement {
    return this.elem.nativeElement;
  }

  @HostBinding('class') get className() {
    return css([
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
    ]);
  }

  @HostListener('click', ['$event']) BackdropClick(event: Event) {
    if ((event.target as any).nodeName === 'DIALOG') {
      this.close();
    }
  }

  /**
   * Escape fires the native 'cancel' event, which would close the dialog
   * instantly and leave our show-state out of sync. Route it through the
   * animated close() instead.
   */
  @HostListener('cancel', ['$event']) EscapeCancel(event: Event) {
    event.preventDefault();
    this.close();
  }

  @HostListener('animationend', ['$event']) ClosingAnimation(e: AnimationEvent) {
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
    this._dialog.removeAttribute('closing');
    this._dialog.showModal();

    // Native showModal focuses the first focusable element; allow consumers
    // to direct initial focus somewhere more useful (e.g. past the close
    // button, onto a primary action or first form field).
    const selector = this.initialFocus();
    if (selector) {
      this._dialog.querySelector<HTMLElement>(selector)?.focus();
    }

    this._show.set(true);
    this.showing.emit(true);
  }

  close() {
    this._dialog.setAttribute('closing', 'true');
    this._show.set(false);
  }
}
