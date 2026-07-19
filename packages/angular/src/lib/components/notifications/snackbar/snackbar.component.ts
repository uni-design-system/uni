import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { css, keyframes } from '@emotion/css';
import { useTimer } from '../../../cdk';
import { Z_INDEX } from '@uni-design-system/uni-core';
import { BaseComponent } from '../../base';
import { COMPONENT_NAME } from '../../base/base.component';
import { UniButtonComponent } from '../../button';
import { UniIconButtonComponent } from '../../icon-button';
import { UniIconComponent } from '../../icon';
import { IconName } from '../../icon/icon.record';
import { UniBoxComponent, UniRowComponent } from '../../layout';
import { UniSymbolComponent } from '../../symbol';
import { UniTextComponent } from '../../text';
import type { UniSnackbarOptions } from './snackbar.model';

@Component({
  selector: 'uni-snackbar, Snackbar',
  imports: [
    UniRowComponent,
    UniBoxComponent,
    UniTextComponent,
    UniIconButtonComponent,
    UniSymbolComponent,
    UniIconComponent,
    UniButtonComponent,
  ],
  templateUrl: './snackbar.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'snackbar' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniSnackbarComponent
  extends BaseComponent<UniSnackbarOptions>
  implements AfterViewInit
{
  timer = useTimer();

  /** Two-way bindable open state: [(show)]. */
  show = model<boolean>();
  iconName = input<IconName>();
  symbolName = input<string>();
  timeout = input<number | string | 'disabled'>();
  actionLabel = input<string>();

  useVariant = input<boolean>(false);

  action = output();
  showing = output<boolean>();

  snackbarRef = viewChild<ElementRef>('snackbar');

  private get _snackbar(): HTMLDialogElement | undefined {
    return this.snackbarRef()?.nativeElement;
  }

  constructor() {
    super();

    effect(() => (this.show() ? this.open() : this.close()));
  }

  protected readonly snackbarClass = computed(() =>
    css({
      ...this.theme.getContainerColors(this.variant() || 'primary', this.useVariant()),
      ...this.theme.radius('sm'),
      ...this.theme.border(this.variant() || 'primary'),
      ...this.theme.boxShadow('dialog'),
      padding: 0,
      transition: `all ${this.componentOptions().transitionDelay} ease-in-out`,
      transitionBehavior: 'allow-discrete',
      opacity: 1,
      bottom: this.componentOptions().bottomPosition,
      zIndex: Z_INDEX.dialog,
      position: 'fixed',

      '&[open]': {
        '@starting-style': {
          bottom: 0,
          opacity: 0,
        },
      },

      '&[closing]': {
        animation: `${this.fadeOut} 0.3s forwards`,
      },
    })
  );

  fadeOut = keyframes({
    '0% ': {
      opacity: 1,
    },
    '100%': {
      opacity: 0,
    },
  });

  ngAfterViewInit() {
    this._snackbar?.addEventListener('animationend', (e) => {
      if (e.animationName == this.fadeOut) {
        this._snackbar?.close();
        this.showing.emit(false);
      }
    });
  }

  private get _timeout(): number | undefined {
    const timeout = this.timeout();
    if (timeout === 'disabled') return undefined;

    return typeof timeout === 'string'
      ? parseFloat(timeout)
      : timeout || this.componentOptions().autoCloseDelay;
  }

  open() {
    this._snackbar?.removeAttribute('closing');
    this._snackbar?.show();
    this.show.set(true);
    this.showing.emit(true);

    if (this._timeout) this.timer.start(this._timeout, () => this.close());
  }

  close() {
    this._snackbar?.setAttribute('closing', 'true');
    this.show.set(false);
  }

  protected pauseTimer() {
    this.timer.pause();
  }

  protected resumeTimer() {
    this.timer.resume();
  }
}
