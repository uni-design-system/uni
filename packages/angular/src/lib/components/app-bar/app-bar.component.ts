import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniAppBarOptions } from './app-bar.model';

/**
 * Horizontal application bar: project leading controls (menu button, logo)
 * with the `leading` attribute, actions with `trailing` (pushed to the far
 * edge), and either pass `title` or project custom center content. Surface,
 * divider, height, typography and spacing all resolve from `appBar` tokens.
 * Place it inside your page's `<header>` landmark.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-app-bar, AppBar',
  providers: [{ provide: COMPONENT_NAME, useValue: 'appBar' }],
  host: { '[class]': 'className()' },
  template: `
    <ng-content select="[leading]" />
    @if (title()) {
      <span class="uni-app-bar-title">{{ title() }}</span>
    }
    <ng-content />
    <span class="uni-app-bar-spacer"></span>
    <ng-content select="[trailing]" />
  `,
})
export class UniAppBarComponent extends BaseComponent<UniAppBarOptions> {
  /** Bar title; alternatively project your own center content. */
  title = input<string>();
  /** Stick the bar to the top of its scroll container. */
  sticky = input(false);

  protected readonly className = computed(() => {
    const options = this.componentOptions();
    return css({
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      width: '100%',
      height: options.height ?? 56,
      flex: 'none',
      ...this.theme.colorPair(options.color),
      ...this.theme.gap(options.gap),
      ...this.theme.paddingLeft(options.padding),
      ...this.theme.paddingRight(options.padding),
      ...this.theme.borderBottom(options.divider),
      ...this.theme.boxShadow(options.elevation),
      '& .uni-app-bar-title': {
        ...this.theme.typeface(options.typeface),
        whiteSpace: 'nowrap',
      },
      '& .uni-app-bar-spacer': { flexGrow: 1 },
      ...(this.sticky() && { position: 'sticky', top: 0, zIndex: 10 }),
    });
  });
}
