import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { css, keyframes } from '@emotion/css';
import { fadeIn, fadeOut } from '@uni-design-system/uni-core';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { uniqueId } from '../../cdk';
import { UniDrawerHeaderComponent } from './drawer-header/drawer-header.component';
import {
  DRAWER_PANEL,
  type DrawerCloseReason,
  type DrawerMode,
  type DrawerPosition,
  type UniDrawerCloseRequest,
  type UniDrawerOptions,
} from './drawer.model';

/**
 * Drawer with two modes sharing one three-row layout:
 *
 * - `side` — an in-flow `<aside>` that pushes content (dashboard sidenav);
 *   opening/closing animates its width, and the divider border primitive
 *   separates it from the page.
 * - `over` — a native `<dialog>` in the top layer: focus trap, Escape and
 *   scrim backdrop come from the platform (same machinery as `uni-dialog`),
 *   sliding in from its edge.
 *
 * **The panel is never the scroll container.** It is a flex column of three
 * rows — an optional `[uni-drawer-header]`, the projected body, an optional
 * `[uni-drawer-buttons]` — and only the body scrolls. The panel itself is
 * `overflow: clip` on both axes. That is what lets a header and a save bar pin
 * while a long form scrolls between them, and it is why the theme's `padding`
 * option lands on the body row rather than the panel: padding on a scrolling
 * box scrolls away with its content.
 *
 * Surface, width, divider, elevation, padding, backdrop, scrim and background
 * all resolve from `drawer` theme tokens.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-drawer',
  imports: [NgTemplateOutlet, UniDrawerHeaderComponent],
  providers: [
    { provide: COMPONENT_NAME, useValue: 'drawer' },
    { provide: DRAWER_PANEL, useExisting: forwardRef(() => UniDrawerComponent) },
  ],
  template: `
    <!-- One <ng-content> per slot, each parked in a template so both modes can
         render the same projected nodes. The catch-all is declared last so the
         two selective slots claim their content first. -->
    <ng-template #header>
      @if (headline()) {
        <div uni-drawer-header></div>
      }
      <ng-content select="[uni-drawer-header]" />
    </ng-template>
    <ng-template #footer>
      <ng-content select="[uni-drawer-buttons], [drawer-buttons]" />
    </ng-template>
    <ng-template #body><ng-content /></ng-template>

    @if (mode() === 'side') {
      <aside [class]="sideClass()" [attr.aria-hidden]="open() ? null : 'true'">
        <ng-container [ngTemplateOutlet]="headerTemplate()" />
        <div [class]="bodyClass()"><ng-container [ngTemplateOutlet]="bodyTemplate()" /></div>
        <ng-container [ngTemplateOutlet]="footerTemplate()" />
      </aside>
    } @else {
      <!-- Click handles the ::backdrop only (target check); keyboard closing
           is the native dialog cancel event, and focus is trapped by
           showModal — the element needs no tabindex of its own. -->
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
      <dialog
        #overlay
        [class]="overClass()"
        [attr.aria-labelledby]="labelledBy()"
        [attr.aria-label]="labelledBy() ? null : ariaLabel()"
        (click)="onBackdropClick($event)"
        (cancel)="onCancel($event)"
        (animationend)="onAnimationEnd($event)"
      >
        <ng-container [ngTemplateOutlet]="headerTemplate()" />
        <div [class]="bodyClass()"><ng-container [ngTemplateOutlet]="bodyTemplate()" /></div>
        <ng-container [ngTemplateOutlet]="footerTemplate()" />
      </dialog>
    }
  `,
})
export class UniDrawerComponent extends BaseComponent<UniDrawerOptions> {
  /** Two-way bindable open state: [(open)]. */
  readonly open = model(false);

  mode = input<DrawerMode>('side');
  position = input<DrawerPosition>('start');

  /**
   * Accessible name for the overlay mode. Only consulted when the drawer has
   * no header to be labelled by.
   *
   * There is deliberately no default. A drawer used as an editor panel that
   * inherited the literal "Navigation" would announce itself as something it
   * is not, and a wrong accessible name is worse than a missing one — the
   * missing one is at least caught by any audit.
   */
  ariaLabel = input<string>();

  /**
   * Title for the drawer's header row. Shorthand for projecting a
   * `[uni-drawer-header]`; project one instead when the header needs more
   * than a title (a record counter, prev/next navigation).
   */
  headline = input<string>();

  /** Whether the header row renders a close button. */
  defaultCloseButton = input(true);

  /** Panel width in px, overriding the theme's `drawer.behavior.width`. */
  width = input<number>();

  /**
   * Whether the overlay dims the page behind it, overriding the theme's
   * `drawer.behavior.scrim`. False leaves the backdrop transparent so the page
   * stays legible while the panel is open — an editor panel beside a board the
   * user is still reading.
   *
   * This does not make the drawer non-modal: focus is still trapped and the
   * page behind is still inert. It is a visibility choice, not a modality one.
   */
  scrim = input<boolean>();

  /**
   * CSS selector for the element to focus when the overlay opens. The native
   * default is the first focusable element, which in an editor panel is
   * usually the close button rather than the first field.
   */
  initialFocus = input<string>();

  /**
   * The drawer is *asking* to close — Escape, the backdrop, or a close/cancel
   * button. Pair with `disableAutoClose` to hold the panel open while an async
   * confirmation runs.
   */
  closeRequest = output<UniDrawerCloseRequest>();

  /**
   * When true the drawer never closes itself; it only emits `closeRequest` and
   * waits for the consumer to set `open`. Off by default, so a drawer that
   * ignores `closeRequest` behaves exactly as it always has.
   */
  disableAutoClose = input(false);

  /** Set by a projected `[uni-drawer-header]` so it can pin flush to the top. */
  readonly hasHeader = signal(false);

  /** Id referenced by aria-labelledby; the header row attaches it to its title. */
  readonly titleId = uniqueId('uni-drawer-title');

  protected readonly labelledBy = computed(() => (this.hasHeader() ? this.titleId : null));

  protected readonly headerTemplate = viewChild.required<TemplateRef<unknown>>('header');
  protected readonly bodyTemplate = viewChild.required<TemplateRef<unknown>>('body');
  protected readonly footerTemplate = viewChild.required<TemplateRef<unknown>>('footer');
  private readonly overlay = viewChild<ElementRef<HTMLDialogElement>>('overlay');

  constructor() {
    super();
    effect(() => {
      const dialog = this.overlay()?.nativeElement;
      if (!dialog) return;
      if (this.open()) {
        if (!dialog.open) {
          dialog.removeAttribute('closing');
          dialog.showModal();
          const selector = this.initialFocus();
          if (selector) dialog.querySelector<HTMLElement>(selector)?.focus();
        }
      } else if (dialog.open) {
        // Slide out first; the dialog closes when the animation reports done.
        dialog.setAttribute('closing', 'true');
      }
    });
  }

  /**
   * The one place a close is decided, so every route in — Escape, the
   * backdrop, the header's close button, the footer's cancel — behaves
   * identically and is equally vetoable.
   */
  requestClose(reason: DrawerCloseReason): void {
    this.closeRequest.emit({ reason });
    if (!this.disableAutoClose()) this.open.set(false);
  }

  protected onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).nodeName === 'DIALOG') this.requestClose('backdrop');
  }

  /** Route Escape through the animated close, keeping `open` in sync. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.requestClose('escape');
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    const dialog = this.overlay()?.nativeElement;
    if (!dialog || !dialog.hasAttribute('closing')) return;
    if (event.animationName.includes(this.slideOut())) {
      dialog.close();
      dialog.removeAttribute('closing');
    }
  }

  private readonly edge = computed(() => (this.position() === 'start' ? '-100%' : '100%'));

  private readonly slideIn = computed(() =>
    keyframes({ from: { transform: `translateX(${this.edge()})` }, to: { transform: 'translateX(0)' } })
  );
  private readonly slideOut = computed(() =>
    keyframes({ from: { transform: 'translateX(0)' }, to: { transform: `translateX(${this.edge()})` } })
  );

  /** The scrim's own fade, so the dimming arrives and leaves with the panel. */
  private readonly scrimIn = keyframes({ ...fadeIn });
  private readonly scrimOut = keyframes({ ...fadeOut });

  /**
   * One timing for everything the panel does. The scrim used to snap in and
   * out around a panel that took 250ms to slide, because `::backdrop` had a
   * background and no animation at all.
   */
  private readonly motion = computed(() =>
    this.theme.motion(this.componentOptions().motion ?? 'panel')
  );

  /** Input wins over the theme option; the literal is the last-resort default. */
  private readonly panelWidth = computed(() => this.width() ?? this.componentOptions().width ?? 280);

  private readonly showScrim = computed(
    () => this.scrim() ?? this.componentOptions().scrim ?? true
  );

  /**
   * The panel's surface. `solid` is the plain color pair; `glass` and
   * `gradient` derive from it, so a theme swaps treatment without restating
   * the color.
   */
  private readonly surface = computed(() => {
    const options = this.componentOptions();
    const pair = this.theme.colorPair(options.color) as
      | { color?: string; backgroundColor?: string }
      | undefined;
    const base = pair?.backgroundColor;
    const treatment = options.background ?? 'solid';
    if (!base || treatment === 'solid') return pair;

    if (treatment === 'glass') {
      return {
        ...pair,
        backgroundColor: `color-mix(in srgb, ${base} 72%, transparent)`,
        backdropFilter: 'blur(12px) saturate(1.4)',
      };
    }
    // A vertical tint toward the content color: always visible, and it never
    // lets the page show through the way a fade to transparent would.
    return {
      ...pair,
      backgroundImage: `linear-gradient(to bottom, ${base} 0%, color-mix(in srgb, ${base} 92%, ${pair?.color ?? 'transparent'} 8%) 100%)`,
    };
  });

  /** The shared flex column: three rows, and never a scroll container itself. */
  private readonly shell = {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    // Both axes, explicitly, and never the shorthand. Setting one axis alone
    // computes the other to `auto` — which is precisely how a panel becomes
    // an accidental scroll container.
    overflowX: 'clip',
    overflowY: 'clip',
  } as const;

  protected readonly sideClass = computed(() => {
    const options = this.componentOptions();
    const motion = this.motion();
    const width = this.panelWidth();
    const start = this.position() === 'start';
    return css({
      ...this.shell,
      height: '100%',
      flex: 'none',
      transition: `width ${motion.duration}ms ${motion.easing}, visibility ${motion.duration}ms`,
      ...this.surface(),
      ...(start
        ? this.theme.borderRight(options.divider)
        : this.theme.borderLeft(options.divider)),
      ...(this.open()
        ? { width, visibility: 'visible' }
        : { width: 0, visibility: 'hidden', border: 'none' }),
    });
  });

  protected readonly overClass = computed(() => {
    const options = this.componentOptions();
    const motion = this.motion();
    const scrim = this.showScrim();
    const start = this.position() === 'start';
    return css({
      ...this.shell,
      width: this.panelWidth(),
      maxWidth: '90vw',
      height: '100dvh',
      maxHeight: '100dvh',
      border: 'none',
      padding: 0,
      margin: start ? '0 auto 0 0' : '0 0 0 auto',
      ...this.surface(),
      ...this.theme.boxShadow(options.elevation),
      // The UA stylesheet hides a closed dialog with `display: none`, which the
      // shell's `display: flex` would otherwise beat on specificity — leaving
      // the panel sitting in normal flow behind the page whenever it is shut.
      // The closing animation still runs: `open` is only removed after it ends.
      '&:not([open])': { display: 'none' },
      // `scrim: false` keeps the modality — focus trap, inert page — but stops
      // the drawer dimming what it covers.
      '&::backdrop': scrim
        ? { ...this.theme.backdrop(options.backdrop) }
        : { background: 'transparent' },
      '&[open]': { animation: `${this.slideIn()} ${motion.duration}ms ${motion.easing}` },
      '&[closing]': { animation: `${this.slideOut()} ${motion.duration}ms ${motion.easing}` },
      // Same duration as the slide, so the dimming tracks the panel rather
      // than snapping. Declared after the `[open]` rules: the two match on
      // specificity while closing, so source order is what makes the fade-out
      // win. Nothing to fade when there is no scrim.
      ...(scrim
        ? {
            '&[open]::backdrop': {
              animation: `${this.scrimIn} ${motion.duration}ms ${motion.easing}`,
            },
            '&[closing]::backdrop': {
              animation: `${this.scrimOut} ${motion.duration}ms ${motion.easing}`,
            },
          }
        : {}),
    });
  });

  /** The only scrolling row, and the only padded one. */
  protected readonly bodyClass = computed(() =>
    css({
      flex: '1 1 auto',
      minHeight: 0,
      // Defence in depth: a positioned body is the containing block for any
      // stray absolute descendant, so nothing can re-home into an ancestor
      // and inflate its scrollHeight. Only safe because the shell above is
      // `overflow: clip` — on its own this would move the phantom overflow
      // into this scroller instead of out of the panel.
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      ...this.theme.padding(this.componentOptions().padding),
    })
  );
}
