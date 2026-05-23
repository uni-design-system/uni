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
} from '@angular/core';
import { css, keyframes } from '@emotion/css';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniIconButtonComponent } from '../icon-button';
import type { UniDialogOptions } from './dialog.model';
import { fadeIn, fadeOut } from '@uni-design-system/uni-core';

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
})
export class UniDialogComponent extends BaseComponent<UniDialogOptions> {
  private elem = inject(ElementRef);

  show = input<boolean>(false);
  private readonly _show = linkedSignal(() => this.show());

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
    this._show.set(true);
    this.showing.emit(true);
  }

  close() {
    this._dialog.setAttribute('closing', 'true');
    this._show.set(false);
  }
}
