import { afterNextRender, ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { css, keyframes } from '@emotion/css';
import { collapseFadeOut, expandFadeIn } from '@uni-design-system/uni-core';
import { motionSafe, uniqueId } from '../../cdk';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-expand',
  imports: [],
  template: `@if (!collapsed()) {
    <div
      [animate.enter]="ready() ? expandAnimation : ''"
      [animate.leave]="collapseAnimation"
      [class]="expandClassName"
    >
      <div [class]="contentClassName">
        <ng-content></ng-content>
      </div>
    </div>
  }`,
  host: {
    '[attr.id]': 'regionId',
    '[class]': 'hostClassName',
  },
})
export class UniExpandComponent {
  collapsed = model(true);

  /** Referenced by the controlling toggle's aria-controls. */
  readonly regionId = uniqueId('uni-expand');

  /**
   * animate.enter has no initial-render guard, so an expand initialized with
   * collapsed = false would play the enter animation on load. Enable
   * animations only after the first render, i.e. on real state changes.
   */
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }

  toggle() {
    this.collapsed.update((collapsed) => !collapsed);
  }

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
   */
  expandAnimation = css(
    motionSafe({
      overflow: 'hidden',
      animation: `${this.expand} ease-in 350ms`,
    }),
  );

  collapseAnimation = css(
    motionSafe({
      overflow: 'hidden',
      animation: `${this.collapse} ease-in 350ms`,
    }),
  );
}
