// https://css-tricks.com/how-to-recreate-the-ripple-effect-of-material-design-buttons/
import { Directive, ElementRef, HostListener, inject, Renderer2 } from '@angular/core';
import { css } from '@emotion/css';

@Directive({
  selector: '[uniRipple]',
  standalone: true,
})
export class RippleDirective {
  private renderer = inject(Renderer2);
  el = inject(ElementRef);

  hostEl;

  constructor() {
    this.hostEl = this.el.nativeElement;
  }

  @HostListener('click', ['$event']) onClick(e: MouseEvent) {
    if (!e) return;
    let ripple, d;
    if (this.hostEl.querySelector(`.${this.rippleClass}`) === null) {
      ripple = this.renderer.createElement('span');
      this.renderer.addClass(ripple, this.rippleClass);
      this.renderer.appendChild(this.hostEl, ripple);
    }

    ripple = this.hostEl.querySelector(`.${this.rippleClass}`);
    this.renderer.appendChild(this.hostEl, ripple);
    this.renderer.removeClass(ripple, this.animateClass);

    if (!ripple.offsetHeight && !ripple.offsetWidth) {
      d = Math.max(this.hostEl.offsetWidth, this.hostEl.offsetHeight);
      this.renderer.setStyle(ripple, 'width', d + 'px');
      this.renderer.setStyle(ripple, 'height', d + 'px');
    }

    const x = e.pageX - this.hostEl.offsetLeft - ripple.offsetWidth / 2;
    const y = e.pageY - this.hostEl.offsetTop - ripple.offsetHeight / 2;

    this.renderer.setStyle(ripple, 'top', y + 'px');
    this.renderer.setStyle(ripple, 'left', x + 'px');
    this.renderer.addClass(ripple, this.animateClass);
  }

  rippleClass = css({
    display: 'block',
    position: 'absolute',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '100%',
    transform: 'scale(0)',
  });

  animateClass = css({
    animation: 'ripple 0.65s linear',

    '@keyframes ripple': {
      '100%': {
        opacity: 0,
        transform: 'scale(2.5)',
      },
    },
  });
}
