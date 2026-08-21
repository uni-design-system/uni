import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  Renderer2,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { css } from '@emotion/css';
import {
  anchorArrowStyles,
  anchorStyles,
  clearAnchorName,
  discreteOverlayTransition,
  FOCUSABLE_SELECTOR,
  isToggleOpen,
  newAnchorName,
  resolveElement,
  resolveFocusTarget,
  restoreOverlayFocus,
  setAnchorName,
  uniqueId,
  useTimer,
  type Placement,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import type { UniPopoverOptions } from './popover.model';

declare const ngDevMode: boolean | undefined;

/**
 * Anchored, top-layer panel on the native `popover` element — the browser owns
 * positioning (CSS anchor positioning), stacking, and, in rich mode, light
 * dismissal. Two modes share one implementation:
 *
 * - `rich` (default): a click-toggled disclosure. The projected `[trigger]`
 *   carries `aria-expanded`/`aria-controls`; with no trigger content the app
 *   drives `open` and no element claims controller ARIA. Focus stays on the
 *   trigger (APG disclosure) unless the panel marks an `[autofocus]` field,
 *   and returns to the trigger on close.
 * - `tooltip`: hover/focus-triggered, `role="tooltip"` + `aria-describedby`,
 *   WCAG 1.4.13 dismissable/hoverable/persistent. Content must not contain
 *   focusable elements.
 *
 * Anchoring and control are separate: `anchor` re-anchors the panel to any
 * element (or id) while the trigger keeps the disclosure semantics.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-popover',
  imports: [UniIconButtonComponent],
  templateUrl: './popover.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'popover' }],
})
export class UniPopoverComponent extends BaseComponent<UniPopoverOptions> {
  private renderer = inject(Renderer2);
  private destroyRef = inject(DestroyRef);

  placement = input<Placement>('bottom');

  /** Light-dismiss on outside click / Escape (native popover="auto"). */
  autoClose = input(true);

  /** Two-way open state; light dismissal and hover timers sync back into it. */
  open = model(false);

  /** `rich` = click-toggled disclosure; `tooltip` = hover/focus description. */
  mode = input<'rich' | 'tooltip'>('rich');

  /**
   * Anchor the panel to another element (or element id, resolved each time
   * the panel opens) while the projected trigger keeps the disclosure ARIA.
   * Empty string means unset.
   */
  anchor = input<HTMLElement | string>();

  /** Title rendered in the header row and used as the accessible name. */
  header = input<string>();

  /** Renders a "Close" icon button in the header row. */
  closable = input(false);

  arrow = input(true);

  /** Panel max-width; numbers are px. Defaults to the theme's `maxWidth`. */
  maxWidth = input<string | number>();

  /** Tooltip-mode hover-open delay, ms; defaults to the theme option. */
  openDelay = input<number>();

  /** Tooltip-mode pointer-leave close delay, ms; defaults to the theme option. */
  closeDelay = input<number>();

  opened = output<void>();
  closed = output<void>();

  readonly panelId = uniqueId('uni-popover');
  protected readonly headerId = uniqueId('uni-popover-header');
  private readonly anchorName = newAnchorName();
  private readonly showing = signal(false);

  /** Whether the `[trigger]` slot projected any element content. */
  private readonly hasTrigger = signal(false);

  private triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');

  private openTimer = useTimer();
  private closeTimer = useTimer();
  /** The element currently carrying our anchor-name. */
  private anchoredEl: HTMLElement | null = null;
  private detachEscape: (() => void) | null = null;

  constructor() {
    super();

    afterNextRender(() => {
      this.hasTrigger.set(this.triggerRef().nativeElement.childElementCount > 0);
      this.applyAnchor();
    });

    // Controller ARIA follows mode/open state; each branch removes the other
    // mode's attributes so a runtime mode flip never leaves stale semantics.
    effect(() => {
      if (!this.hasTrigger()) return;
      const target = resolveFocusTarget(this.triggerRef().nativeElement);
      if (this.mode() === 'tooltip') {
        this.renderer.removeAttribute(target, 'aria-expanded');
        this.renderer.removeAttribute(target, 'aria-controls');
        this.renderer.setAttribute(target, 'aria-describedby', this.panelId);
      } else {
        this.renderer.removeAttribute(target, 'aria-describedby');
        this.renderer.setAttribute(target, 'aria-expanded', `${this.showing()}`);
        this.renderer.setAttribute(target, 'aria-controls', this.panelId);
      }
    });

    // Two-way `open`: drive the native popover when the model changes hands.
    effect(() => {
      const want = this.open();
      if (want === untracked(this.showing)) return;
      if (want) this.showPopover();
      else this.hidePopover();
    });

    this.destroyRef.onDestroy(() => {
      this.detachEscape?.();
      if (this.anchoredEl) clearAnchorName(this.anchoredEl);
      try {
        this.panelRef().nativeElement.hidePopover();
      } catch {
        // popover was already closed or detached
      }
    });
  }

  /** Tooltip mode is always `manual` — its lifecycle belongs to the timers. */
  protected readonly popoverKind = computed(() =>
    this.mode() === 'tooltip' ? 'manual' : this.autoClose() ? 'auto' : 'manual'
  );

  showPopover() {
    if (this.showing()) return;
    this.applyAnchor();
    this.panelRef().nativeElement.showPopover();
  }

  hidePopover() {
    if (!this.showing()) return;
    this.panelRef().nativeElement.hidePopover();
  }

  togglePopover(event?: MouseEvent) {
    if (this.showing()) {
      this.hidePopover();
    } else {
      this.showPopover();
    }
    event?.stopPropagation();
  }

  /**
   * The panel anchors to the detached `anchor` when one resolves (id strings
   * are looked up now, at open time), else to the trigger span.
   */
  private applyAnchor() {
    const el = resolveElement(this.anchor()) ?? this.triggerRef().nativeElement;
    if (this.anchoredEl === el) return;
    if (this.anchoredEl) clearAnchorName(this.anchoredEl);
    setAnchorName(el, this.anchorName);
    this.anchoredEl = el;
  }

  protected onToggle(event: Event) {
    const isOpen = isToggleOpen(event);
    this.showing.set(isOpen);
    this.open.set(isOpen);

    const panel = this.panelRef().nativeElement;
    if (isOpen) {
      if (this.mode() === 'rich') {
        panel.querySelector<HTMLElement>('[autofocus]')?.focus();
      } else {
        this.attachTooltipEscape();
        if (typeof ngDevMode !== 'undefined' && ngDevMode && panel.querySelector(FOCUSABLE_SELECTOR)) {
          console.warn(
            '[uni-popover] tooltip-mode content must not contain focusable elements — ' +
              'a tooltip is a description, not a surface. Use mode="rich" instead.'
          );
        }
      }
      this.opened.emit();
    } else {
      this.detachEscape?.();
      if (this.mode() === 'rich' && this.hasTrigger()) {
        restoreOverlayFocus(panel, resolveFocusTarget(this.triggerRef().nativeElement));
      }
      this.closed.emit();
    }
  }

  protected closeFromButton() {
    this.hidePopover();
    if (this.hasTrigger()) resolveFocusTarget(this.triggerRef().nativeElement).focus();
  }

  // --- rich-mode gesture ----------------------------------------------------

  protected onTriggerClick(event: MouseEvent) {
    if (this.mode() !== 'rich') return;
    this.togglePopover(event);
  }

  // --- tooltip-mode gestures (WCAG 1.4.13) ----------------------------------

  private readonly openDelayMs = computed(
    () => this.openDelay() ?? this.componentOptions().tooltipOpenDelay
  );
  private readonly closeDelayMs = computed(
    () => this.closeDelay() ?? this.componentOptions().tooltipCloseDelay
  );

  protected onTriggerEnter() {
    if (this.mode() !== 'tooltip') return;
    this.closeTimer.stop();
    this.openTimer.start(this.openDelayMs(), () => this.showPopover());
  }

  protected onTriggerLeave() {
    if (this.mode() !== 'tooltip') return;
    this.openTimer.stop();
    if (this.showing()) this.closeTimer.start(this.closeDelayMs(), () => this.hidePopover());
  }

  protected onTriggerFocusIn() {
    if (this.mode() !== 'tooltip') return;
    this.closeTimer.stop();
    this.showPopover();
  }

  protected onTriggerFocusOut() {
    if (this.mode() !== 'tooltip') return;
    this.openTimer.stop();
    this.closeTimer.stop();
    this.hidePopover();
  }

  /** Resting the pointer inside the panel must not dismiss it (hoverable). */
  protected onPanelEnter() {
    if (this.mode() !== 'tooltip') return;
    this.closeTimer.stop();
  }

  protected onPanelLeave() {
    if (this.mode() !== 'tooltip') return;
    if (this.showing()) this.closeTimer.start(this.closeDelayMs(), () => this.hidePopover());
  }

  /**
   * Tooltip panels are `manual`, so Escape is ours: dismiss without moving
   * focus, and stop propagation so an enclosing dialog stays open. Capture
   * phase, document-level — the pointer may be nowhere near the trigger.
   */
  private attachTooltipEscape() {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      this.openTimer.stop();
      this.closeTimer.stop();
      this.hidePopover();
    };
    document.addEventListener('keydown', onKeydown, true);
    this.detachEscape = () => {
      document.removeEventListener('keydown', onKeydown, true);
      this.detachEscape = null;
    };
  }

  // --- styling --------------------------------------------------------------

  protected readonly triggerClassName = css({ display: 'inline-block' });

  private readonly resolvedMaxWidth = computed(() => {
    const width = this.maxWidth();
    if (width === undefined || width === '') return this.componentOptions().maxWidth;
    return typeof width === 'number' ? `${width}px` : width;
  });

  protected readonly popoverClassName = computed(() => {
    const options = this.componentOptions();
    return css({
      ...this.theme.colorPair(options.color),
      ...this.theme.radius(options.borderRadius),
      ...this.theme.boxShadow(options.shadow),
      ...this.theme.typeface(options.typeface),
      ...this.theme.border(options.border),
      padding: 0,
      width: 'max-content',
      maxWidth: this.resolvedMaxWidth(),
      overflow: 'visible',
      ...anchorStyles(this.anchorName, this.placement(), { mainAxis: options.offset }),
      ...discreteOverlayTransition(250, { opacity: 0 }, { opacity: 1 }),
    });
  });

  /** Empty regions collapse, so bare content renders v1's single-region look. */
  protected readonly headerRowClassName = computed(() => {
    const options = this.componentOptions();
    return css({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: options.padding,
      paddingBottom: 0,
      '&:not(:has(*))': { display: 'none' },
    });
  });

  protected readonly titleClassName = computed(() =>
    css({ ...this.theme.typeface(this.componentOptions().headerTypeface), marginRight: 'auto' })
  );

  protected readonly bodyClassName = computed(() => {
    const options = this.componentOptions();
    return css({
      padding: this.mode() === 'tooltip' ? options.tooltipPadding : options.padding,
      '&:empty': { display: 'none' },
    });
  });

  protected readonly footerRowClassName = computed(() => {
    const options = this.componentOptions();
    return css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
      padding: options.padding,
      paddingTop: 0,
      '&:not(:has(*))': { display: 'none' },
    });
  });

  protected readonly arrowClassName = computed(() => {
    const options = this.componentOptions();
    const side = this.placement().split('-')[0];
    // Border on the two edges of the clipped half that face outward
    const borders: Record<string, object> = {
      top: { ...this.theme.borderRight(options.border), ...this.theme.borderBottom(options.border) },
      bottom: { ...this.theme.borderLeft(options.border), ...this.theme.borderTop(options.border) },
      left: { ...this.theme.borderRight(options.border), ...this.theme.borderTop(options.border) },
      right: { ...this.theme.borderLeft(options.border), ...this.theme.borderBottom(options.border) },
    };
    return css({
      ...this.theme.colorPair(options.color),
      ...anchorArrowStyles(this.placement(), options.arrowSize),
      ...borders[side],
    });
  });
}
