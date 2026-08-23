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
  selector: 'uni-snackbar',
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

  private get _snackbar(): HTMLElement | undefined {
    return this.snackbarRef()?.nativeElement;
  }

  constructor() {
    super();

    effect(() => (this.show() ? this.open() : this.close()));
  }

  /**
   * Timing for the enter/leave transition. The deprecated `transitionDelay`
   * wins when a theme still sets it — it is a CSS time string, so `0.35s` and
   * `350ms` both parse back to milliseconds.
   */
  protected readonly motion = computed(() => {
    const options = this.componentOptions();
    const token = this.theme.motion(options.motion ?? 'notification');
    const legacy = options.transitionDelay;
    if (!legacy) return token;
    const ms = legacy.trim().endsWith('ms') ? parseFloat(legacy) : parseFloat(legacy) * 1000;
    return Number.isFinite(ms) ? { ...token, duration: ms } : token;
  });

  protected readonly snackbarClass = computed(() =>
    css({
      // The UA's `[popover]` border, before the theme's own so a themed border
      // still wins. Its `background-color: Canvas` needs no reset — the
      // container colors below beat it on origin, and resetting `background`
      // here would erase them, since it is a shorthand.
      border: 'none',
      ...this.theme.getContainerColors(this.variant() || 'primary', this.useVariant()),
      ...this.theme.radius('sm'),
      ...this.theme.border(this.variant() || 'primary'),
      ...this.theme.boxShadow('dialog'),
      padding: 0,
      transition: `all ${this.motion().duration}ms ${this.motion().easing}`,
      transitionBehavior: 'allow-discrete',
      opacity: 1,

      // `[popover]` arrives centred by `inset: 0; margin: auto`. Undo that,
      // then rebuild the bottom-centred placement `<dialog>` used to get from
      // its own UA rules: shrink to the content, pin to the bottom, and let
      // auto inline margins centre it between the viewport edges.
      position: 'fixed',
      inset: 'auto',
      left: 0,
      right: 0,
      bottom: this.componentOptions().bottomPosition,
      width: 'fit-content',
      maxWidth: '100%',
      marginInline: 'auto',
      marginBlock: 0,

      '&:popover-open': {
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
        // Leaves the top layer only once the fade has finished — hiding first
        // would remove the bar mid-animation.
        this.hide();
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
    try {
      this._snackbar?.showPopover();
    } catch {
      // Already showing — reopening is a no-op, the timer below still restarts.
    }
    this.show.set(true);
    this.showing.emit(true);

    if (this._timeout) this.timer.start(this._timeout, () => this.close());
  }

  close() {
    this._snackbar?.setAttribute('closing', 'true');
    this.show.set(false);
  }

  /** Drops out of the top layer. Called once the closing fade has run. */
  private hide() {
    try {
      this._snackbar?.hidePopover();
    } catch {
      // Already hidden.
    }
  }

  protected pauseTimer() {
    this.timer.pause();
  }

  protected resumeTimer() {
    this.timer.resume();
  }
}
