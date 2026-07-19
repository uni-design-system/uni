import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  Renderer2,
  viewChild,
} from '@angular/core';
import { css } from '@emotion/css';
import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { Z_INDEX } from '@uni-design-system/uni-core';
import { BodyRenderDirective } from '../../directives/body-render/body-render.directive';
import { ThemeService } from '../../theming';
import { Placement } from '../tooltip/tooltip.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-popover, Popover',
  imports: [BodyRenderDirective],
  templateUrl: './popover.component.html',
})
export class UniPopoverComponent implements OnInit, OnDestroy {
  private renderer = inject(Renderer2);
  private theme = inject(ThemeService);

  private delay = 500;
  private showing = false;
  private clickListener?: () => void;

  placement = input<Placement>();
  autoClose = input(true);

  triggerRef = viewChild.required<ElementRef>('trigger');
  popoverRef = viewChild.required<ElementRef>('popover');
  arrowRef = viewChild.required<ElementRef>('arrow');

  private get _trigger(): HTMLSpanElement {
    return this.triggerRef().nativeElement.firstChild;
  }

  private get _popover(): HTMLDivElement {
    return this.popoverRef().nativeElement;
  }

  private get _arrow(): HTMLDivElement {
    return this.arrowRef().nativeElement;
  }

  ngOnInit() {
    if (this.autoClose()) {
      this.clickListener = this.renderer.listen('window', 'click', (e: Event) => {
        if (!e.composedPath().includes(this._popover) && this.showing) this.hidePopover();
      });
    }
  }

  showPopover() {
    this.setPosition();
    this.renderer.addClass(this._popover, this.showClassName);
    this.showing = true;
  }

  hidePopover() {
    this.renderer.removeClass(this._popover, this.showClassName);
    this.showing = false;

    setTimeout(() => {
      this.renderer.setStyle(this._popover, 'left', `-1000px`);
    }, this.delay);
  }

  togglePopover(event: MouseEvent) {
    if (this.showing) {
      this.hidePopover();
    } else {
      this.showPopover();
    }
    event.stopPropagation();
  }

  popoverClassName = css([
    {
      ...this.theme.colorPair('primary-surface'),
      ...this.theme.radius('xs'),
      ...this.theme.boxShadow('raised'),
      ...this.theme.typeface('label'),
      ...this.theme.border('quaternary'),
      padding: '6px 12px',
      width: 'max-content',
      position: 'absolute',
      top: 0,
      left: 0,
      transition: `opacity ${this.delay}ms`,
      opacity: 0,
      zIndex: Z_INDEX.popover,
    },
  ]);

  arrowClassName = css({
    position: 'absolute',
    ...this.theme.colorPair('primary-surface'),
    width: 8,
    height: 8,
    transform: 'rotate(45deg)',
  });

  private showClassName = css({
    opacity: '1 !important',
  });

  private arrowClasses: Record<string, string> = {
    top: css({
      top: '-5px',
      ...this.theme.borderLeft('quaternary'),
      ...this.theme.borderTop('quaternary'),
    }),
    bottom: css({
      bottom: '-5px',
      ...this.theme.borderRight('quaternary'),
      ...this.theme.borderBottom('quaternary'),
    }),
    left: css({
      left: '-5px',
      ...this.theme.borderLeft('quaternary'),
      ...this.theme.borderBottom('quaternary'),
    }),
    right: css({
      right: '-5px',
      ...this.theme.borderRight('quaternary'),
      ...this.theme.borderTop('quaternary'),
    }),
  };

  private setPosition() {
    computePosition(this._trigger, this._popover, {
      placement: this.placement(),
      middleware: [offset(7), flip(), shift({ padding: 5 }), arrow({ element: this._arrow })],
    }).then(({ x, y, placement, middlewareData }) => {
      this.renderer.setStyle(this._popover, 'top', `${y}px`);
      this.renderer.setStyle(this._popover, 'left', `${x}px`);

      const arrowX = middlewareData.arrow?.x;
      const arrowY = middlewareData.arrow?.y;

      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      this.renderer.setStyle(this._arrow, 'top', `${arrowY}px`);
      this.renderer.setStyle(this._arrow, 'left', `${arrowX}px`);
      this.renderer.setStyle(this._arrow, 'right', ``);
      this.renderer.setStyle(this._arrow, 'bottom', ``);

      if (staticSide) {
        this.renderer.addClass(this._arrow, this.arrowClasses[staticSide]);
      }
    });
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener();
    }
  }
}
