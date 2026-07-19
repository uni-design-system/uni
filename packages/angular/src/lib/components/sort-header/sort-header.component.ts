import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';
import { type UniDatasource, SortDirection } from '../../cdk';
import { UniSymbolComponent } from '../symbol/symbol.component';

@Component({
  selector: 'uni-sort-header',
  imports: [UniSymbolComponent],
  templateUrl: './sort-header.component.html',
  host: { '[class]': 'className()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniSortHeaderComponent<T> {
  column = input<keyof T>();
  datasource = input<UniDatasource<T>>();

  // A real <button> makes sorting keyboard-operable (Enter/Space) for free
  protected readonly buttonClass = css({
    all: 'unset',
    cursor: 'pointer',
    display: 'inline-block',

    '&:focus-visible': {
      outline: '2px solid currentColor',
      outlineOffset: 2,
    },
  });

  direction = computed(() => {
    const ds = this.datasource();
    if (!ds) return 'indet';

    return ds.sortColumn() === this.column() ? ds.sortDirection() : 'indet';
  });

  protected readonly className = computed(() => {
    return css({
      cursor: 'pointer',
      position: 'relative',
      height: 24,

      '& .sort-icon': {
        position: 'absolute',
        right: -24,
        top: -4,
        height: 24,
        width: 24,

        transition: 'all 350ms ease-in-out',
        transform: 'rotate(0)',
      },

      '& .sort-icon.asc': {
        transform: 'rotate(-180deg)',
      },

      '& .sort-icon.indet': {
        opacity: 0,
        transform: 'rotate(0)',
      },
    });
  });

  cycleSort() {
    const cycle: SortDirection[] = ['asc', 'desc', 'indet'];
    this.sortDatasource(cycle[cycle.indexOf(this.direction()) + 1] || cycle[0]);
  }

  sortDatasource(direction: SortDirection) {
    this.datasource()?.sortRecords({
      column: this.column(),
      direction,
    });
  }
}
