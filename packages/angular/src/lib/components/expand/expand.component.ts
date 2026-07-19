import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { css, keyframes } from '@emotion/css';
import { collapseFadeOut, expandFadeIn } from '@uni-design-system/uni-core';
import { uniqueId } from '../../cdk';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-expand, Expand',
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
  host: {
    '[attr.id]': 'regionId',
  },
})
export class UniExpandComponent {
  collapsed = model(true);

  /** Referenced by the controlling toggle's aria-controls. */
  readonly regionId = uniqueId('uni-expand');

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
