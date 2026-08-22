import {
  ChangeDetectionStrategy,
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

import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniBoxComponent } from '../layout';
import type { UniDropdownOptions } from './dropdown.model';
import type {
  Border,
  ContainerColorToken,
  NullableSize,
  Radius,
  Shadow,
} from '@uni-design-system/uni-core';
import {
  anchorStyles,
  discreteOverlayTransition,
  isToggleOpen,
  newAnchorName,
  resolveFocusTarget,
  restoreOverlayFocus,
  setAnchorName,
  transformOriginFor,
  TRANSFORM_ORIGINS,
  uniqueId,
  type AnchorOffset,
  type Placement,
} from '../../cdk';

export type AriaHasPopup = 'menu' | 'listbox' | 'dialog' | 'grid' | 'tree' | 'true';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-dropdown',
  imports: [UniBoxComponent],
  template: `
    <!-- 1. The native 'popover' attribute brings it to the top layer with native light-dismiss -->
    <div #dropdown popover="auto" [id]="popoverId" [class]="dropdownClass()">
      <div
        box-layout
        [border]="border() ?? componentOptions().border"
        [borderRadius]="borderRadius() ?? componentOptions().borderRadius"
        [paddingVertical]="paddingVertical()"
        [paddingHorizontal]="paddingHorizontal()"
        [color]="color() ?? componentOptions().color"
        [shadow]="shadow() ?? componentOptions().shadow"
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
  private delay = 100;

  // Reactively track visibility status using Signals
  showing = signal<boolean>(false);

  trigger = input.required<HTMLElement>();
  placement = input<Placement>('bottom-start');
  offset = input<AnchorOffset>({ mainAxis: 4, alignmentAxis: 12 });

  /** CSS anchor-name linking the trigger to the popover panel. */
  private readonly anchorName = newAnchorName();

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

  // Per-instance panel-chrome overrides; undefined falls back to the theme's
  // `dropdown` options, so hosts like uni-menu can restyle their panel
  // without forking the shared dropdown entry.
  border = input<Border | undefined>();
  borderRadius = input<Radius | undefined>();
  shadow = input<Shadow | undefined>();
  color = input<ContainerColorToken | undefined>();

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

  dropdownClass = computed(() => {
    const currentPlacement = this.placement();

    return css([
      {
        // Reset browser agent default popover styles
        border: 'none',
        background: 'transparent',
        padding: 0,
        overflow: 'visible',
        width: 'max-content',

        // Native anchor positioning: the browser keeps the panel attached to
        // the trigger (no scroll/resize listeners needed)
        ...anchorStyles(this.anchorName, currentPlacement, this.offset()),

        // Grows out of the corner touching the trigger. A pre-measure default
        // only: the real origin is measured per toggle (syncTransformOrigin),
        // because position-try fallbacks may have flipped the panel.
        transformOrigin: TRANSFORM_ORIGINS[currentPlacement],

        // Scale-and-fade into and out of the top layer, including the
        // `@starting-style` the entry transition runs from.
        ...discreteOverlayTransition(
          this.delay,
          { opacity: 0, transform: 'scale(0.8)' },
          { opacity: 1, transform: 'scale(1)' },
          'linear'
        ),
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

    // Anchor the popover panel to the trigger element
    setAnchorName(this._trigger, this.anchorName);

    // Wire the ARIA popup contract onto the focusable trigger element
    const focusTarget = this._focusTarget;
    this.renderer.setAttribute(focusTarget, 'aria-expanded', 'false');
    this.renderer.setAttribute(focusTarget, 'aria-controls', this.popoverId);
    if (this.ariaHasPopup()) {
      this.renderer.setAttribute(focusTarget, 'aria-haspopup', this.ariaHasPopup()!);
    }

    // Sync state if user invokes light-dismiss via outside click or Escape key
    this.renderer.listen(this._dropdown, 'toggle', (event: Event) => {
      const isOpened = isToggleOpen(event);
      // Both edges: on open so the entry scale grows out of the trigger, and
      // on close-start so a panel the browser flipped while open (scroll near
      // a viewport edge) still collapses back toward the trigger.
      this.syncTransformOrigin();
      this.showing.set(isOpened);
      this.renderer.setAttribute(this._focusTarget, 'aria-expanded', `${isOpened}`);

      if (isOpened) {
        this.dropdownShowing.emit(true);
      } else {
        this.dropdownHiding.emit(true);
        // Keyboard users are never stranded when the top layer closes (WCAG 2.4.3).
        restoreOverlayFocus(this._dropdown, this._focusTarget);
      }
    });
  }

  /**
   * Scale the open/close animation from the corner touching the trigger,
   * wherever the browser actually placed the panel. The static
   * `TRANSFORM_ORIGINS` entry covers only the *requested* placement; with
   * `position-try-fallbacks` the panel may have flipped at a viewport edge,
   * and a `bottom-end` picker rendered above its field would otherwise still
   * animate from the top-right corner.
   */
  private syncTransformOrigin(): void {
    const origin = transformOriginFor(
      this._dropdown.getBoundingClientRect(),
      this._trigger.getBoundingClientRect()
    );
    if (origin) this.renderer.setStyle(this._dropdown, 'transform-origin', origin);
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

  ngOnDestroy() {
    try {
      this._dropdown.hidePopover();
    } catch {
      // popover was already closed or detached
    }
  }
}
