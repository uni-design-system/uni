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
import { resolveElement, visuallyHidden } from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniButtonComponent } from '../button/button.component';
import { UniCalloutComponent } from '../callout/callout.component';
import type { UniCalloutDismissal } from '../callout/callout.model';
import type { UniTourStep, UniTourOptions } from './tour.model';

declare const ngDevMode: boolean | undefined;

/**
 * A thin sequencer over one `uni-callout`: steps spotlight their targets, a
 * footer walks Next/Back with dots-or-fraction progress, and `advanceOn`
 * gates a step behind an interaction with its target (auto-advancing for
 * clicks, unlocking Next otherwise — announced through one `role="status"`
 * region). Escape or the close button skips the tour and reports the step.
 *
 * `active` is a two-way model, so a tour is deep-linkable and inspectable;
 * steps whose declared target cannot be resolved are skipped (with a dev
 * warning) in the direction of travel rather than erroring.
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

  nextLabel = input('Next');
  backLabel = input('Back');
  skipLabel = input('Skip');
  doneLabel = input('Done');

  started = output<void>();
  stepChanged = output<{ key: string; index: number }>();
  finished = output<void>();
  skipped = output<{ key: string; index: number }>();

  protected readonly calloutOpen = signal(false);
  protected readonly satisfied = signal(true);
  protected readonly announcement = signal('');
  protected readonly resolvedTarget = signal<HTMLElement | undefined>(undefined);
  private readonly presentedIndex = signal<number | null>(null);
  private gateCleanup: (() => void) | null = null;

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

  constructor() {
    super();

    // External writes to `active` (deep links) route into the sequencer.
    effect(() => {
      const index = this.active();
      if (index === untracked(this.presentedIndex)) return;
      untracked(() => (index === null ? this.stopTour() : this.present(index, 1)));
    });

    this.destroyRef.onDestroy(() => this.gateCleanup?.());
  }

  start(at = 0): void {
    this.started.emit();
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
   * Present step `index`, skipping (in the direction of travel) steps whose
   * declared target cannot be resolved right now.
   */
  private present(index: number, dir: 1 | -1): void {
    this.gateCleanup?.();
    const steps = this.steps();
    if (index < 0 || index >= steps.length) {
      this.finishTour();
      return;
    }

    const step = steps[index];
    let target: HTMLElement | null = null;
    if (step.target !== undefined && step.target !== '') {
      target = resolveElement(step.target);
      if (!target) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          console.warn(`[uni-tour] step "${step.key}" target missing — skipped`);
        }
        this.present(index + dir, dir);
        return;
      }
    }

    this.presentedIndex.set(index);
    this.active.set(index);
    this.resolvedTarget.set(target ?? undefined);
    this.setupGate(step, target);
    this.calloutOpen.set(true);
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
        this.announcement.set('Next available');
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
    this.gateCleanup?.();
    this.calloutOpen.set(false);
    this.presentedIndex.set(null);
    this.active.set(null);
    this.finished.emit();
  }

  private stopTour(): void {
    this.gateCleanup?.();
    this.calloutOpen.set(false);
    this.presentedIndex.set(null);
    this.active.set(null);
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
