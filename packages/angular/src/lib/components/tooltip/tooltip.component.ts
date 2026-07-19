import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { css, keyframes } from '@emotion/css';

import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import type { UniTooltipOptions } from './tooltip.model';
import { fadeIn, fadeOut } from '@uni-design-system/uni-core';
import {
  anchorArrowStyles,
  anchorStyles,
  newAnchorName,
  resolveFocusTarget,
  uniqueId,
  useTimer,
  FOCUSABLE_SELECTOR,
  type Placement,
} from '../../cdk';

@Component({
  selector: 'uni-tooltip, Tooltip',
  imports: [],
  // The bubble lives declaratively in the template as a manual popover: the
  // top layer escapes any overflow context (which made appendToBody obsolete)
  // and native CSS anchor positioning keeps it attached to the host.
  template: `<ng-content></ng-content
    ><span
      #tip
      popover="manual"
      role="tooltip"
      [id]="tooltipId"
      [class]="tooltipClassName()"
      (mouseenter)="isMouseInside.set(true)"
      (mouseleave)="isMouseInside.set(false)"
      (animationend)="onAnimationEnd($event)"
      >{{ label() }}<span [class]="arrowClassName()"></span
    ></span>`,
  providers: [{ provide: COMPONENT_NAME, useValue: 'tooltip' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'className()',
    '(click)': 'toggleTooltip()',
    '(mouseenter)': 'mouseenter()',
    '(mouseleave)': 'mouseleave()',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut()',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class UniTooltipComponent extends BaseComponent<UniTooltipOptions> {
  private elRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  private timer = useTimer();
  isMouseInside = signal(false);

  /** Whether the bubble is currently shown (or fading out). */
  private readonly visible = signal(false);

  readonly tooltipId = uniqueId('uni-tooltip');
  private readonly anchorName = newAnchorName();

  hoverDelay = input<number>(500);
  label = input.required<string>();
  placement = input<Placement>('top');
  inlineText = input<boolean>(false);

  /** @deprecated The tooltip renders in the native top layer; ignored. */
  appendToBody = input<boolean>(false);

  private tipRef = viewChild.required<ElementRef<HTMLElement>>('tip');

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
    // the tab sequence. The bubble is always in the DOM, so the describedby
    // relationship is wired once, on the element that receives focus.
    afterNextRender(() => {
      const host = this.elRef.nativeElement as HTMLElement;
      if (!host.querySelector(FOCUSABLE_SELECTOR) && !host.matches(FOCUSABLE_SELECTOR)) {
        this.renderer.setAttribute(host, 'tabindex', '0');
      }
      this.renderer.setAttribute(resolveFocusTarget(host), 'aria-describedby', this.tooltipId);
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
    if (this.visible()) {
      // Dismiss only the tooltip, not an enclosing dialog/popover
      event.stopPropagation();
      this.hideTooltip();
    }
  }

  toggleTooltip() {
    if (this.visible()) {
      this.hideTooltip();
    } else {
      this.showTooltip();
    }
  }

  mouseenter() {
    this.isMouseInside.set(true);
    this.timer.start(this.hoverDelay());
  }

  mouseleave() {
    this.isMouseInside.set(false);
    this.timer.stop();
  }

  showTooltip() {
    if (this.visible()) return;
    const tip = this.tipRef().nativeElement;
    tip.showPopover();
    this.renderer.setAttribute(tip, 'fade', 'in');
    this.visible.set(true);
  }

  hideTooltip() {
    if (!this.visible()) return;
    this.renderer.setAttribute(this.tipRef().nativeElement, 'fade', 'out');
  }

  protected onAnimationEnd(event: AnimationEvent) {
    if (event.animationName.includes(this.tooltipFadeOut)) {
      this.tipRef().nativeElement.hidePopover();
      this.visible.set(false);
    }
  }

  protected readonly className = computed(() =>
    css(
      {
        display: 'inline-flex',
        anchorName: this.anchorName,
      },
      this.inlineText() && {
        cursor: 'help',
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
      }
    )
  );

  private tooltipFadeIn = keyframes({ ...fadeIn });
  private tooltipFadeOut = keyframes({ ...fadeOut });

  protected readonly tooltipClassName = computed(() =>
    css([
      {
        ...this.theme.colorPair(this.componentOptions().color),
        ...this.theme.radius(this.componentOptions().borderRadius),
        ...this.theme.boxShadow(this.componentOptions().shadow),
        ...this.theme.typeface(this.componentOptions().typeface),
        border: 'none',
        padding: 5,
        width: 'max-content',
        ...anchorStyles(this.anchorName, this.placement(), { mainAxis: 6 }),

        '&[fade="in"]': {
          animation: `${this.tooltipFadeIn} ease-in 350ms`,
        },

        '&[fade="out"]': {
          animation: `${this.tooltipFadeOut} ease-in 350ms`,
        },
      },
    ])
  );

  protected readonly arrowClassName = computed(() =>
    css({
      ...this.theme.colorPair(this.componentOptions().color),
      ...anchorArrowStyles(this.placement()),
    })
  );
}
