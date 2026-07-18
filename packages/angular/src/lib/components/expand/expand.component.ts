import { Component, model } from '@angular/core';
import { css, keyframes } from '@emotion/css';
import { collapseFadeOut, expandFadeIn } from '@uni-design-system/uni-core';

@Component({
  selector: 'uni-expand, Expand',
  standalone: true,
  imports: [],
  template: `@if (!collapsed()) {
    <div
      [animate.enter]="expandAnimation"
      [animate.leave]="collapseAnimation"
      [class]="expandClassName"
    >
      <div [class]="contentClassName">
        <ng-content></ng-content>
      </div>
    </div>
  }`,
})
export class UniExpandComponent {
  collapsed = model(true);

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
