import {
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
  focusableElements,
  newAnchorName,
  resolveElement,
  setAnchorName,
  spotlightStyles,
  uniqueId,
  type Placement,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import type { UniCalloutDismissal, UniCalloutOptions } from './callout.model';

/**
 * Anchored coach-mark panel that dims the page and cuts a spotlight hole
 * around its target. Both the scrim and the panel are `popover="manual"`
 * elements shown in order, so they stack deterministically in the top layer
 * above every app z-index, and every scrim piece is CSS-anchor-positioned to
 * the target — the hole tracks scroll/resize/layout with zero listeners.
 *
 * The panel is a non-modal `role="dialog"` (deliberately no `aria-modal`):
 * focus moves into it on open, Tab runs a "duet loop" over the panel's
 * focusables plus the spotlit target while it stays interactive, and on close
 * focus returns to the pre-open element — unless the user moved into the
 * target, where it stays.
 *
 * Storage-free by rule: `key` and the `dismissed` output are the "don't show
 * again" hooks; persistence is the app's business (e.g. cdk local-storage).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-callout',
  imports: [UniIconButtonComponent],
  templateUrl: './callout.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'callout' }],
})
export class UniCalloutComponent extends BaseComponent<UniCalloutOptions> {
  private destroyRef = inject(DestroyRef);

  open = model(false);

  /** Identifies this callout in `dismissed` payloads. Empty string = unset. */
  key = input<string>();

  /** Element (or id, resolved at open time) to spotlight. '' = unset. */
  target = input<HTMLElement | string>();

  placement = input<Placement>('bottom');

  /** Defaults to `spotlight` when a target resolves, else `dim`. */
  backdrop = input<'spotlight' | 'dim' | 'none'>();

  /** When false, a transparent cover blocks the spotlit target. */
  targetInteractive = input(true);

  /** Gates Escape and the close button. */
  dismissible = input(true);

  /** When true, scrim clicks close (reason `backdrop`); else the panel pulses. */
  dismissOnBackdrop = input(false);

  header = input<string>();

  arrow = input(true);

  /** Wins over the header/body labelling; the tour sets "{title}, step n of N". */
  ariaLabel = input<string>();

  /** Accessible name of the dismiss button (the tour passes its skip label). */
  closeLabel = input('Close');

  opened = output<void>();
  closed = output<void>();
  dismissed = output<UniCalloutDismissal>();

  /** Keys pressed while focus is inside the panel (the tour's arrow-key hook). */
  panelKeydown = output<KeyboardEvent>();

  readonly panelId = uniqueId('uni-callout');
  protected readonly headerId = uniqueId('uni-callout-header');
  protected readonly bodyId = uniqueId('uni-callout-body');
  private readonly anchorName = newAnchorName();

  protected readonly showing = signal(false);
  protected readonly activeTarget = signal<HTMLElement | null>(null);
  private readonly scrimShown = signal(false);
  private prevFocus: HTMLElement | null = null;
  private detachKeydown: (() => void) | null = null;

  protected readonly stripSides = ['top', 'bottom', 'left', 'right'] as const;

  private scrimRef = viewChild.required<ElementRef<HTMLElement>>('scrim');
  private panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');
  private actionsRef = viewChild.required<ElementRef<HTMLElement>>('actions');

  constructor() {
    super();

    effect(() => {
      const want = this.open();
      if (want === untracked(this.showing)) return;
      if (want) this.show();
      else this.close('programmatic');
    });

    // Re-seat an open callout when its target or backdrop changes (a tour
    // stepping) instead of closing and reopening — the panel stays up, the
    // original pre-open focus is preserved for the eventual close, and the
    // duet loop re-seats onto the new step's content.
    effect(() => {
      const ref = this.target();
      this.backdrop();
      if (!untracked(this.showing)) return;
      untracked(() => this.retarget(resolveElement(ref)));
    });

    this.destroyRef.onDestroy(() => {
      this.detachKeydown?.();
      const target = untracked(this.activeTarget);
      if (target) clearAnchorName(target);
      for (const ref of [this.panelRef, this.scrimRef]) {
        try {
          ref().nativeElement.hidePopover();
        } catch {
          // popover was already closed or detached
        }
      }
    });
  }

  protected readonly effectiveBackdrop = computed(
    () => this.backdrop() ?? (this.activeTarget() ? 'spotlight' : 'dim')
  );

  private show() {
    if (this.showing()) return;
    const target = resolveElement(this.target());
    this.activeTarget.set(target);
    this.prevFocus = document.activeElement as HTMLElement | null;

    // Anchor insets need the target on screen before the scrim paints; the
    // hole then tracks any further movement natively.
    target?.scrollIntoView?.({ block: 'center', behavior: 'instant' });
    if (target) setAnchorName(target, this.anchorName);

    // Scrim first, panel second: top-layer order is stacking order.
    if ((this.backdrop() ?? (target ? 'spotlight' : 'dim')) !== 'none') {
      this.scrimRef().nativeElement.showPopover();
      this.scrimShown.set(true);
    }
    this.panelRef().nativeElement.showPopover();

    const onKeydown = (event: KeyboardEvent) => this.onKeydown(event);
    document.addEventListener('keydown', onKeydown, true);
    this.detachKeydown = () => {
      document.removeEventListener('keydown', onKeydown, true);
      this.detachKeydown = null;
    };

    this.showing.set(true);
    this.open.set(true);
    this.focusInitial();
    this.opened.emit();
  }

  protected close(reason: UniCalloutDismissal['reason']) {
    if (!this.showing()) return;
    this.detachKeydown?.();

    const target = this.activeTarget();
    const active = document.activeElement;
    const focusInTarget = !!target && (target === active || target.contains(active));

    for (const ref of [this.panelRef, this.scrimRef]) {
      try {
        ref().nativeElement.hidePopover();
      } catch {
        // scrim may not have been shown (backdrop="none")
      }
    }
    if (target) clearAnchorName(target);
    this.activeTarget.set(null);
    this.showing.set(false);
    this.scrimShown.set(false);
    this.open.set(false);

    // The duet loop may have sent the user into the target on purpose — don't
    // yank them back out of it.
    if (!focusInTarget && this.prevFocus && document.contains(this.prevFocus)) {
      this.prevFocus.focus();
    }

    this.dismissed.emit({ key: this.key() || undefined, reason });
    this.closed.emit();
  }

  /** Move an open callout to a new target without a close/open round trip. */
  private retarget(target: HTMLElement | null) {
    const prev = this.activeTarget();
    if (prev && prev !== target) clearAnchorName(prev);
    target?.scrollIntoView?.({ block: 'center', behavior: 'instant' });
    if (target) setAnchorName(target, this.anchorName);
    this.activeTarget.set(target);

    const wantScrim = (this.backdrop() ?? (target ? 'spotlight' : 'dim')) !== 'none';
    if (wantScrim !== this.scrimShown()) {
      const scrim = this.scrimRef().nativeElement;
      const panel = this.panelRef().nativeElement;
      try {
        if (wantScrim) {
          // Top-layer order is stacking order: re-show the panel above the
          // late-arriving scrim.
          scrim.showPopover();
          panel.hidePopover();
          panel.showPopover();
        } else {
          scrim.hidePopover();
        }
      } catch {
        // a piece was already in the requested state
      }
      this.scrimShown.set(wantScrim);
    }
    this.focusInitial();
  }

  /** `[autofocus]` → first action → first panel focusable → the panel itself. */
  private focusInitial() {
    const panel = this.panelRef().nativeElement;
    const first =
      panel.querySelector<HTMLElement>('[autofocus]') ??
      focusableElements(this.actionsRef().nativeElement)[0] ??
      focusableElements(panel)[0] ??
      panel;
    first.focus({ preventScroll: true });
  }

  /**
   * Capture phase so Escape works from inside the spotlit target and the tab
   * loop preempts the page. Non-Tab keys surface through `panelKeydown`.
   */
  private onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.dismissible()) {
        event.preventDefault();
        this.close('escape');
      }
      return;
    }
    if (event.key !== 'Tab') {
      if (this.panelRef().nativeElement.contains(document.activeElement)) {
        this.panelKeydown.emit(event);
      }
      return;
    }
    if (this.effectiveBackdrop() === 'none') return; // nothing is blocked — tab naturally

    // Duet loop: panel focusables plus the interactive target.
    const loop = focusableElements(this.panelRef().nativeElement);
    const target = this.activeTarget();
    if (target && this.targetInteractive()) loop.push(target);
    if (!loop.length) return;

    const index = loop.indexOf(document.activeElement as HTMLElement);
    event.preventDefault();
    const next = event.shiftKey
      ? loop[(index <= 0 ? loop.length : index) - 1]
      : loop[(index + 1) % loop.length];
    next.focus();
  }

  /** A stray click shouldn't kill onboarding: nudge the panel instead. */
  protected onBackdropClick() {
    if (this.dismissOnBackdrop()) {
      this.close('backdrop');
      return;
    }
    try {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.panelRef().nativeElement.animate?.(
        [
          { translate: '0 0' },
          { translate: '0 -3px', offset: 0.3 },
          { translate: '0 2px', offset: 0.6 },
          { translate: '0 0' },
        ],
        { duration: 400, easing: 'ease' }
      );
    } catch {
      // animation is decoration; environments without WAAPI just skip it
    }
  }

  // --- styling --------------------------------------------------------------

  private readonly spotlight = computed(() => {
    const options = this.componentOptions();
    return spotlightStyles(this.anchorName, {
      pad: options.spotlightPadding,
      ringWidth: options.ringWidth,
      scrimColor: options.scrimColor,
    });
  });

  protected readonly scrimClassName = computed(() => {
    const options = this.componentOptions();
    return css({
      position: 'fixed',
      inset: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      border: 0,
      padding: 0,
      background: 'transparent',
      overflow: 'visible',
      pointerEvents: 'none',
      '& > *': { position: 'fixed' },
      ...discreteOverlayTransition(options.transitionMs, { opacity: 0 }, { opacity: 1 }),
    });
  });

  protected readonly windowClassName = computed(() => {
    const ring =
      this.theme.colorPalette()[this.variant()] ?? this.theme.colorPalette()['primary'];
    return css({
      ...this.spotlight().window,
      ...this.theme.radius(this.componentOptions().spotlightRadius),
      borderColor: ring,
    });
  });

  protected stripClassName(side: (typeof this.stripSides)[number]): string {
    return css(this.spotlight().strips[side]);
  }

  protected readonly coverClassName = computed(() => css(this.spotlight().cover));

  protected readonly fullCoverClassName = computed(() =>
    css({
      inset: 0,
      background: this.componentOptions().scrimColor,
      pointerEvents: 'auto',
    })
  );

  protected readonly panelClassName = computed(() => {
    const options = this.componentOptions();
    const anchored = this.activeTarget() !== null;
    return css({
      ...this.theme.colorPair(options.color),
      ...this.theme.radius(options.borderRadius),
      ...this.theme.boxShadow(options.shadow),
      ...this.theme.typeface(options.typeface),
      width: options.width,
      maxWidth: 'calc(100vw - 32px)',
      padding: 0,
      border: 0,
      overflow: 'visible',
      // A target-less panel keeps the popover UA styles (inset:0 + margin:auto)
      // and centers in the viewport; anchorStyles resets them for anchoring.
      ...(anchored
        ? anchorStyles(this.anchorName, this.placement(), {
            mainAxis: options.offset + options.spotlightPadding,
          })
        : {}),
      ...discreteOverlayTransition(
        options.transitionMs,
        { opacity: 0, translate: '0 6px' },
        { opacity: 1, translate: '0 0' }
      ),
    });
  });

  protected readonly headRowClassName = computed(() => {
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
    return css({ padding: options.padding, paddingTop: 6, paddingBottom: 12, '&:empty': { display: 'none' } });
  });

  protected readonly actionsRowClassName = computed(() => {
    const options = this.componentOptions();
    return css({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: options.padding,
      paddingTop: 0,
      '&:not(:has(*))': { display: 'none' },
    });
  });

  protected readonly arrowClassName = computed(() => {
    const options = this.componentOptions();
    return css({
      ...this.theme.colorPair(options.color),
      ...anchorArrowStyles(this.placement(), options.arrowSize),
    });
  });
}
