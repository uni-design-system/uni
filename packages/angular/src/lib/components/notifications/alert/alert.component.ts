import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  input,
  model,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { css, keyframes } from '@emotion/css';

import { fadeOut, type Variant } from '@uni-design-system/uni-core';

import { BaseComponent } from '../../base';
import { COMPONENT_NAME } from '../../base/base.component';
import { UniIconButtonComponent } from '../../icon-button';
import { UniIconComponent } from '../../icon';
import { IconName } from '../../icon/icon.record';
import { UniBoxComponent, UniRowComponent } from '../../layout';
import { UniSymbolComponent } from '../../symbol';
import { UniTextComponent } from '../../text';
import type { UniAlertOptions } from './alert.model';

@Component({
  selector: 'uni-alert, Alert',
  standalone: true,
  imports: [
    UniRowComponent,
    UniIconButtonComponent,
    UniTextComponent,
    UniBoxComponent,
    UniIconComponent,
    UniSymbolComponent,
  ],
  templateUrl: './alert.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'alert' }],
})
export class UniAlertComponent extends BaseComponent<UniAlertOptions> implements AfterViewInit {
  show = model<boolean>();
  iconName = input<IconName | undefined>(undefined);
  symbolName = input<string | undefined>(undefined);
  useVariant = input<boolean>(false);

  @Output() showing = new EventEmitter<boolean>();

  @ViewChild('alert') alertRef?: ElementRef<HTMLDialogElement>;

  private readonly alertState = signal<'open' | 'closing' | 'closed'>('closed');

  private readonly effectiveVariant = computed<Variant>(
    () => this.variant() || this.componentOptions().defaultVariant
  );

  protected readonly alertClass = computed(() =>
    css({
      ...this.theme.getContainerColors(this.effectiveVariant(), this.useVariant()),
      ...this.theme.radius(this.componentOptions().borderRadius),
      ...this.theme.border(this.effectiveVariant()),
      ...this.theme.boxShadow(this.componentOptions().elevation),

      transition: `all ${this.componentOptions().transitionSpeed}s ease-in-out`,
      transitionBehavior: 'allow-discrete',
      opacity: 1,
      top: this.componentOptions().topPosition,

      '&[open]': {
        '@starting-style': {
          top: 0,
          opacity: 0,
        },
      },

      '&[closing]': {
        animation: `${this.fadeOut} 0.3s forwards`,
      },
    })
  );

  private readonly fadeOut = keyframes({ ...fadeOut });

  constructor() {
    super();
    effect(() => {
      if (this.show() === true) {
        this.open();
      } else if (this.show() === false) {
        this.close();
      }
    });
  }

  ngAfterViewInit() {
    this.alertRef?.nativeElement.addEventListener('animationend', (e) => {
      if (e.animationName === this.fadeOut.toString()) {
        this.alertRef?.nativeElement.close();
        this.showing.emit(false);
        this.alertState.set('closed');
      }
    });
  }

  open() {
    if (!this.alertRef?.nativeElement) return;

    this.alertRef.nativeElement.removeAttribute('closing');
    this.alertRef.nativeElement.show();
    this.alertState.set('open');
    this.showing.emit(true);
  }

  close() {
    if (!this.alertRef?.nativeElement) return;

    this.alertRef.nativeElement.setAttribute('closing', 'true');
    this.alertState.set('closing');
    this.show.set(false);
  }

  protected readonly effectiveIconName = computed<IconName | undefined>(() => this.iconName());
}
