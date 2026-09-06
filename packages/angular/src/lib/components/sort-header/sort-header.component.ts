import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';
import { type UniDatasource, SortDirection } from '../../cdk';
import { ThemeService } from '../../theming/theme.service';
import { UniIconComponent } from '../icon';

@Component({
  selector: 'uni-sort-header',
  imports: [UniIconComponent],
  templateUrl: './sort-header.component.html',
  host: { '[class]': 'className()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniSortHeaderComponent<T> {
  private readonly theme = inject(ThemeService);

  /**
   * The arrow answers a click, so it rides `control`. This component has no
   * theme entry of its own, so it names the token directly rather than
   * exposing an option that would have nowhere to live.
   */
  private readonly motion = computed(() => this.theme.motion('control'));

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

        transition: `all ${this.motion().duration}ms ${this.motion().easing}`,
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
