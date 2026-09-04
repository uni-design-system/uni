import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { css, keyframes } from '@emotion/css';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniIconButtonComponent } from '../icon-button';
import type { UniDialogOptions } from './dialog.model';
import { fadeIn, fadeOut } from '@uni-design-system/uni-core';
import { uniqueId } from '../../cdk';

/**
 * Modal dialog on the native `<dialog>` element, laid out as three rows:
 * an optional `[dialog-header]`, the projected body, an optional
 * `[dialog-buttons]`.
 *
 * **The surface is never the scroll container.** It is a flex column that is
 * `overflow: clip` on both axes; the header and buttons pin while only the
 * body row scrolls. Unlike the drawer, which is deliberately viewport-tall,
 * the dialog stays content-sized: it has no `height`, and grows until it hits
 * `calc(100dvh - 2 x inset)` — the point at which the body starts to scroll.
 *
 * The theme's `padding` insets all three rows (which is what makes the default
 * header read as a pill floating inside the surface); `bodyPadding` pads the
 * scrolling row alone.
 */
@Component({
  selector: 'dialog[uni-dialog]',
  imports: [UniIconButtonComponent, NgTemplateOutlet],
  template: `
    @if (defaultCloseButton()) {
      <button
        icon-button
        iconName="close"
        variant="ghost"
        (click)="close()"
        [class]="closeButton"
        size="md"
      >
        Close
      </button>
    }

    <!-- One <ng-content> per slot, each parked in a template. Angular claims
         projected nodes in declaration order, so the catch-all must be declared
         last — while being rendered between the two pinned rows below. -->
    <ng-template #header><ng-content select="[uni-dialog-header], [dialog-header]" /></ng-template>
    <ng-template #footer><ng-content select="[uni-dialog-buttons], [dialog-buttons]" /></ng-template>
    <ng-template #body><ng-content /></ng-template>

    <ng-container [ngTemplateOutlet]="headerTemplate()" />
    <div [class]="bodyClass()"><ng-container [ngTemplateOutlet]="bodyTemplate()" /></div>
    <ng-container [ngTemplateOutlet]="footerTemplate()" />
  `,
  providers: [{ provide: COMPONENT_NAME, useValue: 'dialog' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-labelledby]': 'hasTitle() ? titleId : null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[class]': 'className()',
    '(click)': 'backdropClick($event)',
    '(cancel)': 'escapeCancel($event)',
    '(animationend)': 'closingAnimation($event)',
  },
})
export class UniDialogComponent extends BaseComponent<UniDialogOptions> {
  private elem = inject(ElementRef);

  /** Two-way bindable open state: [(show)]. */
  show = model<boolean>(false);

  /**
   * Accessible name for dialogs without a DialogHeader. When a DialogHeader
   * is present it labels the dialog automatically via aria-labelledby.
   */
  ariaLabel = input<string>();

  /**
   * CSS selector for the element to focus when the dialog opens. Defaults to
   * the browser's native behavior (first focusable element).
   */
  initialFocus = input<string>();

  defaultCloseButton = input<boolean>();

  /** Id referenced by aria-labelledby; DialogHeader attaches it to the title. */
  readonly titleId = uniqueId('uni-dialog-title');
  readonly hasTitle = signal(false);

  /** Emits true once opened and false once the closing animation finishes. */
  showing = output<boolean>();

  protected readonly headerTemplate = viewChild.required<TemplateRef<unknown>>('header');
  protected readonly bodyTemplate = viewChild.required<TemplateRef<unknown>>('body');
  protected readonly footerTemplate = viewChild.required<TemplateRef<unknown>>('footer');

  constructor() {
    super();
    effect(() => (this.show() ? this.open() : this.close()));
  }

  private get _dialog(): HTMLDialogElement {
    return this.elem.nativeElement;
  }

  /**
   * One timing for the whole move, panel and scrim together — the same `panel`
   * token the drawer's slide reads, so the two surfaces no longer disagree
   * about how long arriving takes.
   */
  private readonly motion = computed(() =>
    this.theme.motion(this.componentOptions().motion ?? 'panel')
  );

  /** The gap the surface keeps from the viewport edge before its body scrolls. */
  private readonly inset = computed(() =>
    this.theme.getSpacing(this.componentOptions().inset ?? 'lg')
  );

  protected readonly className = computed(() => {
    const inset = this.inset();
    const motion = this.motion();
    return css([
      {
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        // Both axes, explicitly, and never the shorthand. Setting one axis
        // alone computes the other to `auto` — which is precisely how a
        // surface becomes an accidental scroll container.
        overflowX: 'clip',
        overflowY: 'clip',
        // No `height`: the dialog is content-sized right up to this cap, and
        // only then does the body row start to scroll.
        maxHeight: `calc(100dvh - ${inset} * 2)`,
        maxWidth: `calc(100vw - ${inset} * 2)`,

        ...this.theme.radius(this.componentOptions().borderRadius),
        ...this.theme.colorPair(this.componentOptions().color),
        ...this.theme.border(this.componentOptions().border),
        ...this.theme.boxShadow(this.componentOptions().elevation),
        ...this.theme.padding(this.componentOptions().padding || 'none'),

        // The UA stylesheet hides a closed dialog with `display: none`, which
        // the `display: flex` above would otherwise beat on specificity —
        // leaving the surface in normal flow behind the page whenever it is
        // shut. The closing animation still runs: `open` is only removed once
        // it ends.
        '&:not([open])': { display: 'none' },

        // The shared `backdrops` primitive, so the dialog and the drawer dim
        // the page identically. A raw style object is still honoured.
        '&::backdrop': {
          ...this.theme.backdrop(this.componentOptions().backdrop),
        },

        '&[open], &::backdrop': {
          animation: `${this.dialogFadeIn} ${motion.easing} ${motion.duration}ms`,
        },

        '&[closing], &[closing]::backdrop': {
          animation: `${this.dialogFadeOut} ${motion.easing} ${motion.duration}ms`,
        },
      },
    ]);
  });

  /** The only scrolling row, and the only one `bodyPadding` touches. */
  protected readonly bodyClass = computed(() =>
    css({
      // Not the drawer's `1 1 auto`: the dialog must not stretch to fill a cap
      // it has not reached, so the body never grows past its content.
      flex: '0 1 auto',
      // What lets this row shrink below its content and scroll, rather than
      // pushing the buttons off the surface.
      minHeight: 0,
      // Defence in depth: a positioned body is the containing block for any
      // stray absolute descendant, so nothing can re-home into an ancestor and
      // inflate its scrollHeight.
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      ...this.theme.padding(this.componentOptions().bodyPadding),
    })
  );

  protected backdropClick(event: Event) {
    if ((event.target as HTMLElement).nodeName === 'DIALOG') {
      this.close();
    }
  }

  /**
   * Escape fires the native 'cancel' event, which would close the dialog
   * instantly and leave our show-state out of sync. Route it through the
   * animated close() instead.
   */
  protected escapeCancel(event: Event) {
    event.preventDefault();
    this.close();
  }

  protected closingAnimation(e: AnimationEvent) {
    // Close the dialog if the animation is finished
    if (e.animationName.includes(this.dialogFadeOut)) {
      this._dialog.close();
      this._dialog.removeAttribute('closing');
      this.showing.emit(false);
    }
  }

  /**
   * Doubled selector (`.css-x.css-x`) so these win over the icon button's own
   * class, which sets `position: relative` and is emitted after this one.
   * Without it the close never leaves the flow — it used to sit inline at the
   * top of the surface, and under the flex column it would take a whole row.
   */
  closeButton = css({
    '&&': {
      position: 'absolute',
      right: 12,
      top: 12,
    },
  });

  private dialogFadeIn = keyframes({ ...fadeIn });
  private dialogFadeOut = keyframes({ ...fadeOut });

  open() {
    if (this._dialog.open) return;

    this._dialog.removeAttribute('closing');
    this._dialog.showModal();

    // Native showModal focuses the first focusable element; allow consumers
    // to direct initial focus somewhere more useful (e.g. past the close
    // button, onto a primary action or first form field).
    const selector = this.initialFocus();
    if (selector) {
      this._dialog.querySelector<HTMLElement>(selector)?.focus();
    }

    this.show.set(true);
    this.showing.emit(true);
  }

  close() {
    // Strict check: outside a real <dialog> host (e.g. unit tests) `open`
    // is undefined and close() should still run.
    if (this._dialog.open === false) return;

    this._dialog.setAttribute('closing', 'true');
    this.show.set(false);
  }
}
