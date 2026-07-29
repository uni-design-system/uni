import { afterNextRender, ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { css, keyframes } from '@emotion/css';
import { collapseFadeOut, expandFadeIn } from '@uni-design-system/uni-core';
import { uniqueId } from '../../cdk';

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

  expandClassName = css({
    display: 'grid',
  });

  contentClassName = css({
    minHeight: 0,
  });

  private expand = keyframes({ ...expandFadeIn });
  private collapse = keyframes({ ...collapseFadeOut });

  expandAnimation = css({
    overflow: 'hidden',
    animation: `${this.expand} ease-in 350ms`,
  });

  collapseAnimation = css({
    overflow: 'hidden',
    animation: `${this.collapse} ease-in 350ms`,
  });
}
