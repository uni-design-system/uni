import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  Renderer2,
  signal,
  untracked,
} from '@angular/core';
import { css } from '@emotion/css';
import { createAnnouncer, visuallyHidden } from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniButtonComponent } from '../button/button.component';
import { UniCalloutComponent } from '../callout/callout.component';
import type { UniCalloutDismissal } from '../callout/callout.model';
import type {
  UniTourOptions,
  UniTourStep,
  UniTourTarget,
  UniTourTargetMissing,
} from './tour.model';

declare const ngDevMode: boolean | undefined;

/** The default string resolver: a target names an element by id. */
const byId = (ref: string): HTMLElement | null => document.getElementById(ref);

/**
 * A thin sequencer over one `uni-callout`: steps spotlight their targets, a
 * footer walks Next/Back with dots-or-fraction progress, and `advanceOn`
 * gates a step behind an interaction with its target (auto-advancing for
 * clicks, unlocking Next otherwise — announced through one `role="status"`
 * region). Escape or the close button skips the tour and reports the step.
 *
 * `active` is a two-way model, so a tour is deep-linkable and inspectable.
 *
 * Targets resolve when a step presents, not before: an element, a string
 * handed to `resolveTarget` (an id by default), or a function. One that is
 * not there yet is waited for — the DOM is watched for `targetTimeout` and
 * the step presents the moment it appears — so a page that lands in pieces,
 * or a panel the previous step's click opened, does not lose its steps. Only
 * a target that never shows is skipped, in the direction of travel, with a
 * dev warning and a `targetMissing` event.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-tour',
  imports: [UniButtonComponent, UniCalloutComponent],
  templateUrl: './tour.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'tour' }],
})
export class UniTourComponent extends BaseComponent<UniTourOptions> {
  private renderer = inject(Renderer2);
  private destroyRef = inject(DestroyRef);

  steps = input.required<UniTourStep[]>();

  /** The presented step index, or null when the tour is not running. */
  active = model<number | null>(null);

  /**
   * Per-instance override of the `progressStyle` theme option, so a one-off
   * pointer can differ from the app's tours without a second theme entry.
   * A one-step tour renders no progress whatever this says — one dot beside
   * Done counts nothing.
   */
  progressStyle = input<'dots' | 'fraction' | 'none'>();

  /**
   * Maps a string target to its element; `document.getElementById` when
   * unset. A controller whose steps name `data-tour` tokens gives
   * `(token) => document.querySelector(`[data-tour="${token}"]`)` once,
   * instead of pre-resolving every step.
   */
  resolveTarget = input<(ref: string) => HTMLElement | null | undefined>();

  /**
   * How long, in milliseconds, a step waits for a target that is not in the
   * DOM when it presents. The document is watched for the whole window, so
   * the step opens as soon as the target renders; past it the step is
   * skipped. `0` skips at once.
   */
  targetTimeout = input(2000);

  nextLabel = input('Next');
  backLabel = input('Back');
  skipLabel = input('Skip');
  doneLabel = input('Done');

  /** The first step of a run was presented — from `start()` or from a write to `active`. */
  started = output<void>();
  stepChanged = output<{ key: string; index: number }>();
  /**
   * The run walked past its last step. Never emitted for a run in which no
   * step was presented (empty `steps`, every target missing): a tour that
   * never opened did not finish.
   */
  finished = output<void>();
  skipped = output<{ key: string; index: number }>();
  /** A step's target was not found within `targetTimeout`, so the step was skipped. */
  targetMissing = output<UniTourTargetMissing>();

  protected readonly calloutOpen = signal(false);
  protected readonly satisfied = signal(true);
  /** Repeats must still be heard: the same gate message can come round
      again on a later step. */
  protected readonly announcer = createAnnouncer();
  protected readonly resolvedTarget = signal<HTMLElement | undefined>(undefined);
  private readonly presentedIndex = signal<number | null>(null);
  private gateCleanup: (() => void) | null = null;
  /** Tears down the watch for a step whose target has not rendered yet. */
  private waitCleanup: (() => void) | null = null;
  /** Whether this run has presented a step — what `started` and `finished` key on. */
  private presentedAny = false;
  /** A `start()` that found no steps, waiting for them to arrive. */
  private readonly pendingStart = signal<number | null>(null);

  protected readonly index = computed(() => this.presentedIndex() ?? 0);
  protected readonly currentStep = computed<UniTourStep | undefined>(() => {
    const index = this.presentedIndex();
    return index === null ? undefined : this.steps()[index];
  });
  protected readonly isLast = computed(() => this.index() >= this.steps().length - 1);
  protected readonly clickGate = computed(
    () => this.currentStep()?.advanceOn?.event === 'click'
  );
  /** Gated steps force an interactive target — the gate needs the gesture. */
  protected readonly targetInteractive = computed(() => {
    const step = this.currentStep();
    return step?.advanceOn ? true : (step?.targetInteractive ?? true);
  });
  protected readonly stepAriaLabel = computed(() => {
    const step = this.currentStep();
    return step ? `${step.title}, step ${this.index() + 1} of ${this.steps().length}` : '';
  });
  /** The progress to draw: the input, else the theme option; none for a single step. */
  protected readonly progress = computed<'dots' | 'fraction' | 'none'>(() => {
    if (this.steps().length <= 1) return 'none';
    return this.progressStyle() ?? this.componentOptions().progressStyle ?? 'dots';
  });

  constructor() {
    super();

    // External writes to `active` (deep links) route into the sequencer.
    effect(() => {
      const index = this.active();
      if (index === untracked(this.presentedIndex)) return;
      untracked(() => (index === null ? this.stopTour() : this.present(index, 1)));
    });

    // A `start()` issued before the steps were bound — a host that sets them
    // from a service and starts in the same turn sees `[]` — begins once they
    // arrive, rather than walking off the end of an empty list.
    effect(() => {
      const at = this.pendingStart();
      if (at === null || !this.steps().length) return;
      this.pendingStart.set(null);
      untracked(() => this.present(at, 1));
    });

    this.destroyRef.onDestroy(() => {
      this.gateCleanup?.();
      this.waitCleanup?.();
    });
  }

  /**
   * Begin a run at step `at`. `started` fires once the first step is actually
   * presented — not here — so a start that presents nothing reports nothing.
   * With no steps yet, the start waits for them.
   */
  start(at = 0): void {
    if (!this.steps().length) {
      this.pendingStart.set(at);
      return;
    }
    this.present(at, 1);
  }

  next(): void {
    this.advance();
  }

  back(): void {
    const index = this.presentedIndex();
    if (index !== null && index > 0) this.present(index - 1, -1);
  }

  skip(): void {
    const step = this.currentStep();
    const index = this.presentedIndex();
    this.stopTour();
    if (step && index !== null) this.skipped.emit({ key: step.key, index });
  }

  protected advance(): void {
    const index = this.presentedIndex();
    if (index === null) return;
    if (index >= this.steps().length - 1) this.finishTour();
    else this.present(index + 1, 1);
  }

  /**
   * Present step `index`. A step whose target does not resolve right now is
   * waited for (`targetTimeout`), and skipped in the direction of travel
   * only if it never appears.
   */
  private present(index: number, dir: 1 | -1): void {
    this.waitCleanup?.();
    this.gateCleanup?.();
    const steps = this.steps();
    if (index < 0 || index >= steps.length) {
      this.finishTour();
      return;
    }

    const step = steps[index];
    if (step.target === undefined || step.target === '') {
      this.show(index, step, null);
      return;
    }
    const target = this.resolve(step.target);
    if (target) this.show(index, step, target);
    else this.waitForTarget(index, step, dir);
  }

  /**
   * The element a target stands for, or null. Looked up fresh every time —
   * never cached across steps, the page may have re-rendered — and an
   * element no longer in the document counts as missing.
   */
  private resolve(ref: UniTourTarget): HTMLElement | null {
    let element: HTMLElement | null | undefined;
    if (typeof ref === 'function') element = ref();
    else if (typeof ref === 'string') element = (this.resolveTarget() ?? byId)(ref);
    else element = ref;
    return element && element.isConnected ? element : null;
  }

  /**
   * Watch the document until the step's target renders or the window runs
   * out. The previous step stays up meanwhile — a page landing in pieces
   * should not flash the tour closed and open again.
   */
  private waitForTarget(index: number, step: UniTourStep, dir: 1 | -1): void {
    const timeout = this.targetTimeout();
    if (timeout <= 0 || typeof MutationObserver === 'undefined') {
      this.skipStep(index, step, dir);
      return;
    }
    const observer = new MutationObserver(() => {
      const target = this.resolve(step.target as UniTourTarget);
      if (!target) return;
      this.waitCleanup?.();
      this.show(index, step, target);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    const timer = setTimeout(() => {
      this.waitCleanup?.();
      this.skipStep(index, step, dir);
    }, timeout);
    this.waitCleanup = () => {
      observer.disconnect();
      clearTimeout(timer);
      this.waitCleanup = null;
    };
  }

  private skipStep(index: number, step: UniTourStep, dir: 1 | -1): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(`[uni-tour] step "${step.key}" target missing — skipped`);
    }
    this.targetMissing.emit({ key: step.key, index });
    this.present(index + dir, dir);
  }

  private show(index: number, step: UniTourStep, target: HTMLElement | null): void {
    this.presentedIndex.set(index);
    this.active.set(index);
    this.resolvedTarget.set(target ?? undefined);
    this.setupGate(step, target);
    this.calloutOpen.set(true);
    if (!this.presentedAny) {
      this.presentedAny = true;
      this.started.emit();
    }
    this.stepChanged.emit({ key: step.key, index });
  }

  private setupGate(step: UniTourStep, target: HTMLElement | null): void {
    const gate = step.advanceOn;
    this.satisfied.set(!gate);
    if (!gate || !target) return;

    const auto = gate.auto ?? gate.event === 'click';
    const unlisten = this.renderer.listen(target, gate.event, () => {
      if (untracked(this.satisfied) && !auto) return;
      this.satisfied.set(true);
      if (auto) {
        this.gateCleanup?.();
        this.advance();
      } else {
        this.announcer.announce('Next available');
      }
    });
    this.gateCleanup = () => {
      unlisten();
      this.gateCleanup = null;
    };
  }

  protected onDismissed(dismissal: UniCalloutDismissal): void {
    if (dismissal.reason === 'programmatic') return; // that's us, stepping or stopping
    const step = this.currentStep();
    const index = this.presentedIndex();
    this.stopTour();
    if (step && index !== null) this.skipped.emit({ key: step.key, index });
  }

  /** Arrow keys navigate only while focus is inside the panel. */
  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight' && this.satisfied() && !this.clickGate()) {
      event.preventDefault();
      this.advance();
    } else if (event.key === 'ArrowLeft' && this.index() > 0) {
      event.preventDefault();
      this.back();
    }
  }

  private finishTour(): void {
    const ran = this.presentedAny;
    this.stopTour();
    if (ran) this.finished.emit();
    else if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn('[uni-tour] no step could be presented — the run did not start');
    }
  }

  private stopTour(): void {
    this.waitCleanup?.();
    this.gateCleanup?.();
    this.calloutOpen.set(false);
    this.presentedIndex.set(null);
    this.active.set(null);
    this.presentedAny = false;
  }

  // --- styling --------------------------------------------------------------

  protected readonly statusClassName = css(visuallyHidden);

  protected readonly footerClassName = computed(() =>
    css({
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      gap: this.theme.spacing()[this.componentOptions().footerGap],
    })
  );

  protected readonly dotsClassName = computed(() => {
    const colors = this.theme.colorPalette();
    const on = colors[this.variant()] ?? colors['primary'];
    return css({
      display: 'inline-flex',
      gap: 5,
      margin: '0 auto',
      '& i': {
        width: 6,
        height: 6,
        borderRadius: 999,
        background: colors['surface-variant'],
        border: `1px solid ${colors['outline'] ?? colors['surface-variant']}`,
      },
      '& i.on': { background: on, borderColor: on },
    });
  });

  protected readonly fractionClassName = css({ margin: '0 auto' });
}
