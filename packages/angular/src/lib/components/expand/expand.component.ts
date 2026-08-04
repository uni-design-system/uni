import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { css, keyframes } from '@emotion/css';
import {
  collapseFadeOut,
  EXPAND_DEFAULT_SPEED,
  expandDuration,
  expandFadeIn,
} from '@uni-design-system/uni-core';
import { motionSafe, uniqueId } from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniExpandOptions } from './expand.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-expand',
  imports: [],
  providers: [{ provide: COMPONENT_NAME, useValue: 'expand' }],
  template: `@if (!collapsed()) {
    <div
      [animate.enter]="ready() ? expandAnimation : ''"
      [animate.leave]="collapseAnimation"
      [class]="expandClassName"
      [style.animation-duration]="cssDuration()"
    >
      <div #content [class]="contentClassName">
        <ng-content></ng-content>
      </div>
    </div>
  }`,
  host: {
    '[attr.id]': 'regionId',
    '[class]': 'hostClassName',
  },
})
export class UniExpandComponent extends BaseComponent<UniExpandOptions> {
  collapsed = model(true);

  /**
   * Exact per-instance duration in seconds. Bypasses size-aware scaling —
   * an explicit number means the consumer wants that number. Omitted, the
   * duration derives from the `expand` theme options' `transitionSpeed`
   * scaled by content height (see `duration`).
   */
  transitionSpeed = input<number>();

  /** Referenced by the controlling toggle's aria-controls. */
  readonly regionId = uniqueId('uni-expand');

  /**
   * animate.enter has no initial-render guard, so an expand initialized with
   * collapsed = false would play the enter animation on load. Enable
   * animations only after the first render, i.e. on real state changes.
   */
  protected readonly ready = signal(false);

  private readonly contentRef = viewChild<ElementRef<HTMLElement>>('content');

  /**
   * Last observed content height. Retained after collapse (the observer
   * disconnects but the signal keeps its value) so the leave animation and
   * the next reveal are timed to the real size. Until the first measurement
   * lands — one frame into the very first reveal — the duration falls back
   * to the unscaled token; CSS remaps animation progress when
   * `animation-duration` updates, so the retime is imperceptible that early.
   */
  private readonly contentHeight = signal<number | undefined>(undefined);

  constructor() {
    super();
    afterNextRender(() => this.ready.set(true));
    afterRenderEffect((onCleanup) => {
      const content = this.contentRef()?.nativeElement;
      if (!content) return;
      const observer = new ResizeObserver(() => this.contentHeight.set(content.scrollHeight));
      observer.observe(content);
      onCleanup(() => observer.disconnect());
    });
  }

  toggle() {
    this.collapsed.update((collapsed) => !collapsed);
  }

  /**
   * The resolved duration in seconds: the `transitionSpeed` input verbatim,
   * or the `expand` theme options' `transitionSpeed` scaled by content height
   * (`expandDuration` — √-of-height, clamped) so short regions stay snappy
   * and tall ones aren't rushed. The public sync hook: Expand Area binds this
   * to its toggle so the chevron rotates on the region's clock, and consumers
   * can bind adjacent styling the same way
   * (`[style.transition-duration]="expand.duration() + 's'"`).
   */
  readonly duration = computed(() => {
    const override = this.transitionSpeed();
    if (override !== undefined) return override;
    const speed = this.componentOptions().transitionSpeed ?? EXPAND_DEFAULT_SPEED;
    const height = this.contentHeight();
    return height === undefined ? speed : expandDuration(height, speed);
  });

  protected readonly cssDuration = computed(() => `${this.duration()}s`);

  /**
   * A custom element is `display: inline` by default, which would lay the
   * animated grid out as a block-in-inline box and distort the revealed
   * content's spacing. Every consumer would otherwise have to write
   * `uni-expand { display: block }` themselves.
   */
  protected readonly hostClassName = css({
    display: 'block',
  });

  expandClassName = css({
    display: 'grid',
  });

  contentClassName = css({
    minHeight: 0,
  });

  private expand = keyframes({ ...expandFadeIn });
  private collapse = keyframes({ ...collapseFadeOut });

  /**
   * Reveal is motion-safe (WCAG 2.3.3): under `prefers-reduced-motion` these
   * classes are empty, so the region appears and disappears instantly.
   * `overflow: hidden` rides inside the guard deliberately — it exists to clip
   * the growing box mid-animation, and leaving it applied at rest would crop
   * decorations that legitimately paint outside the region (focus rings,
   * offset outlines). Angular removes a leaving node on the next frame when it
   * detects no animation, so nothing hangs when the guard strips them.
   *
   * The classes carry the default duration; the animated div's
   * `[style.animation-duration]` binding overrides it with the resolved
   * `duration`, so the classes stay static while timing tracks the theme and
   * the content's size through signals alone.
   */
  expandAnimation = css(
    motionSafe({
      overflow: 'hidden',
      animation: `${this.expand} ease-in-out ${EXPAND_DEFAULT_SPEED}s`,
    }),
  );

  collapseAnimation = css(
    motionSafe({
      overflow: 'hidden',
      animation: `${this.collapse} ease-in-out ${EXPAND_DEFAULT_SPEED}s`,
    }),
  );
}
