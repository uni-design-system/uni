import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { css } from '@emotion/css';
import {
  autoUpdate,
  computePosition,
  offset,
  OffsetOptions,
  Placement,
  shift,
} from '@floating-ui/dom';

import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniBoxComponent } from '../layout';
import type { UniDropdownOptions } from './dropdown.model';
import type { NullableSize } from '@uni-design-system/uni-core';
import { resolveFocusTarget, uniqueId } from '../../cdk';

export type AriaHasPopup = 'menu' | 'listbox' | 'dialog' | 'grid' | 'tree' | 'true';

@Component({
  selector: 'uni-dropdown, Dropdown',
  standalone: true,
  imports: [UniBoxComponent],
  template: `
    <!-- 1. The native 'popover' attribute brings it to the top layer with native light-dismiss -->
    <div #dropdown popover="auto" [id]="popoverId" [class]="dropdownClass()">
      <div
        box-layout
        [border]="componentOptions().border"
        [borderRadius]="componentOptions().borderRadius"
        [paddingVertical]="paddingVertical()"
        [paddingHorizontal]="paddingHorizontal()"
        [color]="componentOptions().color"
        [shadow]="componentOptions().shadow"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
  providers: [{ provide: COMPONENT_NAME, useValue: 'dropdown' }],
})
export class UniDropdownComponent
  extends BaseComponent<UniDropdownOptions>
  implements OnInit, OnDestroy
{
  private renderer = inject(Renderer2);
  private cleanupAutoUpdate?: () => void;
  private delay = 100;

  // Reactively track visibility status using Signals
  showing = signal<boolean>(false);

  trigger = input.required<HTMLElement>();
  placement = input<Placement>('bottom-start');
  offset = input<OffsetOptions>({ mainAxis: 4, alignmentAxis: 12 });

  /**
   * Value for aria-haspopup on the trigger, describing what the popover
   * contains (e.g. 'menu' for Menu, 'dialog' for rich content). When unset,
   * only aria-expanded/aria-controls are managed.
   */
  ariaHasPopup = input<AriaHasPopup | null>(null);

  /** Document-unique id of the popover element, for aria-controls wiring. */
  readonly popoverId = uniqueId('uni-dropdown');

  paddingVertical = input<NullableSize>();
  paddingHorizontal = input<NullableSize>();

  dropdownShowing = output<boolean>();
  dropdownHiding = output<boolean>();

  @ViewChild('dropdown', { static: true })
  dropdownRef!: ElementRef<HTMLDivElement>;

  private get _trigger(): HTMLElement {
    return this.trigger();
  }
  private get _dropdown(): HTMLDivElement {
    return this.dropdownRef.nativeElement;
  }

  private transformOriginMap: Record<Placement, string> = {
    top: 'bottom center',
    right: 'center left',
    bottom: 'top center',
    left: 'center right',
    'top-start': 'bottom left',
    'top-end': 'bottom right',
    'right-start': 'top left',
    'right-end': 'bottom left',
    'bottom-start': 'top left',
    'bottom-end': 'top right',
    'left-start': 'top right',
    'left-end': 'bottom right',
  };

  dropdownClass = computed(() => {
    const currentPlacement = this.placement();

    return css([
      {
        // Reset browser agent default popover styles
        border: 'none',
        background: 'transparent',
        margin: 0,
        padding: 0,
        overflow: 'visible',
        width: 'max-content',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,

        // 2. Animate discrete properties across top layer layout contexts
        transitionProperty: 'transform, opacity, display, overlay',
        transitionDuration: `${this.delay}ms`,
        transitionTimingFunction: 'linear',
        transitionBehavior: 'allow-discrete',

        // Hidden State (Closed)
        opacity: 0,
        transform: 'scale(0.8)',
        transformOrigin: this.transformOriginMap[currentPlacement],

        // 3. Active state styling controlled via the native browser pseudo-class
        ['&:popover-open']: {
          opacity: 1,
          transform: 'scale(1)',
        },

        // 4. Starting-style rules what properties animate *from* when transitioning in
        ['@starting-style']: {
          ['&:popover-open']: {
            opacity: 0,
            transform: 'scale(0.8)',
          },
        },
      },
    ]);
  });

  /** The element that receives focus and carries the ARIA popup state. */
  private get _focusTarget(): HTMLElement {
    return resolveFocusTarget(this._trigger);
  }

  ngOnInit(): void {
    // Single native click binding to manage open/close commands
    this.renderer.listen(this._trigger, 'click', (e: Event) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Wire the ARIA popup contract onto the focusable trigger element
    const focusTarget = this._focusTarget;
    this.renderer.setAttribute(focusTarget, 'aria-expanded', 'false');
    this.renderer.setAttribute(focusTarget, 'aria-controls', this.popoverId);
    if (this.ariaHasPopup()) {
      this.renderer.setAttribute(focusTarget, 'aria-haspopup', this.ariaHasPopup()!);
    }

    // Sync state if user invokes light-dismiss via outside click or Escape key
    this.renderer.listen(this._dropdown, 'toggle', (event: any) => {
      const isOpened = event.newState === 'open';
      this.showing.set(isOpened);
      this.renderer.setAttribute(this._focusTarget, 'aria-expanded', `${isOpened}`);

      if (isOpened) {
        this.dropdownShowing.emit(true);
        this.cleanupAutoUpdate = autoUpdate(this._trigger, this._dropdown, () =>
          this.updatePosition()
        );
      } else {
        this.dropdownHiding.emit(true);
        if (this.cleanupAutoUpdate) {
          this.cleanupAutoUpdate();
          this.cleanupAutoUpdate = undefined;
        }
        this.restoreFocus();
      }
    });
  }

  /**
   * Returns focus to the trigger when the popover closes while focus was
   * inside it (or was dropped on <body> by the top layer closing), so
   * keyboard users are never stranded (WCAG 2.4.3).
   */
  private restoreFocus() {
    const active = document.activeElement;
    if (active === document.body || (active && this._dropdown.contains(active))) {
      this._focusTarget.focus();
    }
  }

  toggleDropdown() {
    if (this.showing()) {
      this._dropdown.hidePopover();
    } else {
      this._dropdown.showPopover();
    }
  }

  hideDropdown() {
    this._dropdown.hidePopover();
  }

  private async updatePosition() {
    const { x, y } = await computePosition(this._trigger, this._dropdown, {
      placement: this.placement(),
      middleware: [offset(this.offset()), shift({ padding: 5 })],
    });

    this.renderer.setStyle(this._dropdown, 'left', `${x}px`);
    this.renderer.setStyle(this._dropdown, 'top', `${y}px`);
  }

  ngOnDestroy() {
    if (this.cleanupAutoUpdate) this.cleanupAutoUpdate();
    try {
      this._dropdown.hidePopover();
    } catch {
      // popover was already closed or detached
    }
  }
}
