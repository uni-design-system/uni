import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  HostBinding,
  inject,
  input,
  Input,
  OnDestroy,
  Renderer2,
  signal,
} from '@angular/core';
import { css, keyframes } from '@emotion/css';
import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom';

import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import type { UniTooltipOptions } from './tooltip.model';
import { Placement } from './tooltip.types';
import { fadeIn, fadeOut, Z_INDEX } from '@uni-design-system/uni-core';
import { resolveFocusTarget, uniqueId, useTimer, FOCUSABLE_SELECTOR } from '../../cdk';

@Component({
  selector: 'uni-tooltip, Tooltip',
  standalone: true,
  imports: [],
  template: `<ng-content></ng-content>`,
  providers: [{ provide: COMPONENT_NAME, useValue: 'tooltip' }],
  host: {
    '(click)': 'toggleTooltip()',
    '(mouseenter)': 'mouseenter()',
    '(mouseleave)': 'mouseleave()',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut()',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class UniTooltipComponent extends BaseComponent<UniTooltipOptions> implements OnDestroy {
  private elRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  private timer = useTimer();
  hoverDelayMs = signal(500);
  isMouseInside = signal(false);

  private tooltip!: HTMLElement | null;
  private arrow!: HTMLElement | null;
  private readonly tooltipId = uniqueId('uni-tooltip');

  hoverDelay = input<number>(500);
  label = input.required<string>();
  placement = input<Placement>('top');
  inlineText = input<boolean>(false);

  @Input() appendToBody?: boolean;

  constructor() {
    super();

    effect(() => {
      const timerActive = this.timer.isActive();
      const mouseInside = this.isMouseInside();

      // If the timer finished and the mouse is still inside, show tooltip
      if (!timerActive && mouseInside) {
        this.showTooltip();
      }
      // If the mouse left and the timer is not running, hide tooltip
      else if (!mouseInside) {
        this.hideTooltip();
      }
    });

    // A tooltip must be reachable by keyboard (WCAG 1.4.13): when the
    // projected content has no focusable element, the host itself joins
    // the tab sequence.
    afterNextRender(() => {
      const host = this.elRef.nativeElement as HTMLElement;
      if (!host.querySelector(FOCUSABLE_SELECTOR) && !host.matches(FOCUSABLE_SELECTOR)) {
        this.renderer.setAttribute(host, 'tabindex', '0');
      }
    });
  }

  onFocusIn(event: FocusEvent) {
    // Only keyboard-driven focus shows the tooltip immediately; mouse
    // interaction keeps the hover-delay behavior.
    if ((event.target as HTMLElement).matches(':focus-visible')) {
      this.showTooltip();
    }
  }

  onFocusOut() {
    if (!this.isMouseInside()) {
      this.hideTooltip();
    }
  }

  onEscape(event: Event) {
    if (this.tooltip) {
      // Dismiss only the tooltip, not an enclosing dialog/popover
      event.stopPropagation();
      this.hideTooltip();
    }
  }

  toggleTooltip() {
    if (this.tooltip) {
      this.hideTooltip();
    } else {
      this.showTooltip();
    }
  }

  mouseenter() {
    this.isMouseInside.set(true);
    this.timer.start(this.hoverDelayMs());
  }

  mouseleave() {
    this.isMouseInside.set(false);
    this.timer.stop();
  }

  showTooltip() {
    if (this.tooltip) return;
    this.initializeTooltip();
    this.renderer.setAttribute(this.tooltip, 'fade', 'in');
  }

  hideTooltip() {
    if (!this.tooltip) return;
    this.renderer.setAttribute(this.tooltip, 'fade', 'out');
  }

  @HostBinding('class') get className() {
    return css(
      {
        display: 'inline-flex',
      },
      this.inlineText() && {
        cursor: 'help',
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
      }
    );
  }

  private tooltipFadeIn = keyframes({ ...fadeIn });
  private tooltipFadeOut = keyframes({ ...fadeOut });

  private tooltipClassName = css([
    {
      ...this.theme.colorPair(this.componentOptions().color),
      ...this.theme.radius(this.componentOptions().borderRadius),
      ...this.theme.boxShadow(this.componentOptions().shadow),
      ...this.theme.typeface(this.componentOptions().typeface),
      padding: 5,
      width: 'max-content',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: Z_INDEX.tooltip,

      '&[fade="in"]': {
        animation: `${this.tooltipFadeIn} ease-in 350ms`,
      },

      '&[fade="out"]': {
        animation: `${this.tooltipFadeOut} ease-in 350ms`,
      },
    },
  ]);

  private arrowClassName = css({
    position: 'absolute',
    ...this.theme.colorPair(this.componentOptions().color),
    width: 8,
    height: 8,
    transform: 'rotate(45deg)',
  });

  private createTooltip() {
    this.tooltip = this.renderer.createElement('span');

    this.renderer.appendChild(
      this.tooltip,
      this.renderer.createText(this.label()) // textNode
    );

    this.renderer.appendChild(
      this.appendToBody ? document.body : this.elRef.nativeElement,
      this.tooltip
    );
    this.renderer.addClass(this.tooltip, this.tooltipClassName);
    this.renderer.setAttribute(this.tooltip, 'role', 'tooltip');
    this.renderer.setAttribute(this.tooltip, 'id', this.tooltipId);
    // Describe the element that actually receives focus, not the wrapper
    this.renderer.setAttribute(
      resolveFocusTarget(this.elRef.nativeElement),
      'aria-describedby',
      this.tooltipId
    );

    // The pointer may move onto the tooltip itself without dismissing it
    // (WCAG 1.4.13 hoverable) — relevant when appended to <body>.
    this.renderer.listen(this.tooltip, 'mouseenter', () => this.isMouseInside.set(true));
    this.renderer.listen(this.tooltip, 'mouseleave', () => this.isMouseInside.set(false));

    this.renderer.listen(this.tooltip, 'animationend', (event) => {
      if (event.animationName.includes(this.tooltipFadeOut)) this.destroyTooltip();
    });
  }

  private createArrow() {
    this.arrow = this.renderer.createElement('div');
    this.renderer.appendChild(this.tooltip, this.arrow);
    this.renderer.addClass(this.arrow, this.arrowClassName);
  }

  private setPosition() {
    if (!this.tooltip || !this.arrow) return;
    computePosition(this.elRef.nativeElement, this.tooltip, {
      placement: this.placement(),
      middleware: [offset(6), flip(), shift({ padding: 5 }), arrow({ element: this.arrow })],
    }).then(({ x, y, placement, middlewareData }) => {
      this.renderer.setStyle(this.tooltip, 'top', `${y}px`);
      this.renderer.setStyle(this.tooltip, 'left', `${x}px`);

      // Accessing the data
      const arrowX = middlewareData.arrow?.x;
      const arrowY = middlewareData.arrow?.y;

      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      this.renderer.setStyle(this.arrow, 'top', `${arrowY}px`);
      this.renderer.setStyle(this.arrow, 'left', `${arrowX}px`);
      this.renderer.setStyle(this.arrow, 'right', ``);
      this.renderer.setStyle(this.arrow, 'bottom', ``);

      if (staticSide) {
        this.renderer.setStyle(this.arrow, staticSide, `-4px`);
      }
    });
  }

  private initializeTooltip() {
    this.createTooltip();
    this.createArrow();
    this.setPosition();
  }

  private destroyTooltip() {
    this.renderer.removeAttribute(
      resolveFocusTarget(this.elRef.nativeElement),
      'aria-describedby'
    );
    this.renderer.removeChild(
      this.appendToBody ? document.body : this.elRef.nativeElement,
      this.tooltip
    );
    this.renderer.removeChild(
      this.appendToBody ? document.body : this.elRef.nativeElement,
      this.arrow
    );
    this.tooltip = null;
    this.arrow = null;
  }

  ngOnDestroy() {
    this.hideTooltip();
  }
}
