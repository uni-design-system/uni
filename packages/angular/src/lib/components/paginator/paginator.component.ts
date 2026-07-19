import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import { css } from '@emotion/css';
import { type UniDatasource } from '../../cdk';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniRowComponent } from '../layout';
import { UniTextComponent } from '../text/text.component';
import type { UniPaginatorOptions } from './paginator.model';

@Component({
  selector: 'uni-paginator, Paginator',
  imports: [UniRowComponent, UniIconButtonComponent, UniTextComponent],
  templateUrl: './paginator.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'paginator' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'navigation',
    'aria-label': 'Pagination',
  },
})
export class UniPaginatorComponent<T> extends BaseComponent<UniPaginatorOptions> {
  datasource = input<UniDatasource<T>>();
  initPageSize = input<number>();

  showPageSize = input<boolean>(true);
  showPageJumper = input<boolean>(true);
  showPageNumbers = input<boolean>(true);

  constructor() {
    super();
    effect(() => {
      const pageSize = this.initPageSize();
      if (!pageSize) return;
      const ds = this.datasource();
      if (ds) ds.setPageSize(pageSize);
    });
  }

  protected readonly inputClass = computed(() =>
    css({
      textAlign: 'center',
      ...this.theme.border(this.componentOptions().inputBorder),
      ...this.theme.radius(this.componentOptions().inputBorderRadius),
      height: 22,
      fontSize: 16,
      padding: '2px 0 0 2px',

      '&:focus-visible': {
        outline: '2px solid currentColor',
        outlineOffset: 1,
      },
    })
  );

  protected readonly pageClass = computed(() =>
    css({
      all: 'unset',
      boxSizing: 'border-box',
      ...this.theme.radius(this.componentOptions().pageBorderRadius),
      padding: 2,
      width: 20,
      display: 'flex',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'solid 1px transparent',

      '&:focus-visible': {
        outline: '2px solid currentColor',
        outlineOffset: 1,
      },

      '&.current': {
        ...this.theme.border(this.componentOptions().currentPageBorder),
        ...this.theme.radius(this.componentOptions().currentPageBorderRadius),
        cursor: 'unset',
      },

      '&:hover:not(.current)': {
        backgroundColor: 'rgba(0,0,0,0.1)',
      },
    })
  );

  updatePageSize(event: Event) {
    const ds = this.datasource();
    const pageSize = (event.target as HTMLInputElement).value;
    if (ds) ds.setPageSize(parseInt(pageSize));
  }

  jumpToPage(event: Event) {
    const ds = this.datasource();
    const page = (event.target as HTMLInputElement).value;
    if (ds) ds.jumpToPage(parseInt(page));
  }

  isNumber(page: unknown) {
    return typeof page === 'number';
  }
}
