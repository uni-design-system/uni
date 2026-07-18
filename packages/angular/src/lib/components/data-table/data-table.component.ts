import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  effect,
  input,
  linkedSignal,
  output,
  signal,
  type TemplateRef,
} from '@angular/core';
import { css } from '@emotion/css';
import { UniDatasource, UniServerSideDatasource } from '../../cdk';
import { fadeIn, Z_INDEX } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniIconComponent } from '../icon';
import { UniBoxComponent, UniCenterComponent } from '../layout';
import { UniScrollAreaComponent } from '../scroll-area/scroll-area.component';
import { UniSortHeaderComponent } from '../sort-header/sort-header.component';
import { UniTextComponent } from '../text/text.component';
import { ColumnDefinition, type UniDataTableOptions } from './data-table.models';

@Component({
  selector: 'uni-data-table, DataTable',
  imports: [
    NgTemplateOutlet,
    UniBoxComponent,
    UniScrollAreaComponent,
    UniTextComponent,
    UniSortHeaderComponent,
    UniIconComponent,
    UniCenterComponent,
  ],
  templateUrl: './data-table.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'dataTable' }],
})
export class UniDataTableComponent<T> extends BaseComponent<UniDataTableOptions> {
  datasource = input.required<UniDatasource<T>>();
  columns = input.required<ColumnDefinition<T>[]>();

  detailRowTemplate = input<TemplateRef<{ $implicit: T; index: number }>>();
  expandedIndex = signal<number | null>(null);

  useMultiSelect = input<boolean>(false);
  useRowClick = input<boolean>(true);
  highlight? = input<(row: T) => boolean>();

  height = input<string>();
  scrollable = signal(false);

  tableClass!: string;
  headerClass!: string;
  footerClass!: string;
  thClass!: string;
  tdClass!: string;
  trClass!: string;
  detailRowClass!: string;

  loadingOverlayClass = css({
    animation: 'fadeIn 350ms ease-in-out',
    '@keyframes fadeIn': { ...fadeIn },
  });

  rowSelect = output<T>();
  rowClick = output<T>();

  displayedColumns = signal<string[]>([]);

  constructor() {
    super();

    effect(() => {
      this.displayedColumns.set(this.columns().map((c) => c.columnDef as string));

      this.tableClass = css({
        ...this.theme.colorPair(this.componentOptions().color),
        width: '100%',
        borderSpacing: 0,
      });

      this.headerClass = css({
        borderBottom: this.getBorder(this.componentOptions().thHorizontalBorder),

        '&:empty': {
          display: 'none',
        },
      });

      this.footerClass = css({
        borderTop: this.getBorder(this.componentOptions().thHorizontalBorder),

        '&:empty': {
          display: 'none',
        },
      });

      this.thClass = css({
        ...this.theme.colorPair(this.componentOptions().thColor),

        position: 'sticky',
        top: 0,
        textAlign: 'center',
        padding: 0, // Reset renderers default padding

        ...this.theme.padding(this.componentOptions().thPadding),

        borderBottom: this.getBorder(this.componentOptions().thHorizontalBorder),
        '&:not(:last-child)': {
          borderRight: this.getBorder(this.componentOptions().thVerticalBorder),
        },
        '&:last-child.scrollable': {
          paddingRight: 29,
        },
        '&.sticky': {
          position: 'sticky',
          left: 0,
          zIndex: Z_INDEX.sticky,
        },
      });

      this.tdClass = css([
        {
          textAlign: 'center',
          padding: 0, // Reset renderers default padding
          '&:not(:last-child)': {
            borderRight: this.getBorder(this.componentOptions().tdVerticalBorder),
          },
          '&:last-child.scrollable': {
            // The last scrollable column allows space for the scrollbar.
            paddingRight: 29,
          },
          '&.sticky': {
            position: 'sticky',
            left: 0,
            zIndex: Z_INDEX.sticky,
            ...this.theme.colorPair(this.componentOptions().tdStickyColor),
          },
          '&:not(.template)': {
            // Allow templates to define their own styles
            ...this.theme.padding(this.componentOptions().tdPadding),
          },
        },
      ]);

      this.trClass = css(
        {
          '& td': {
            ...this.theme.backgroundColor('transparent'),
            transition: 'all 0.28s ease',
          },
          ':not(:last-child) td': {
            borderBottom: this.getBorder(this.componentOptions().tdHorizontalBorder),
          },
        },
        this.useRowClick() && {
          '&:hover td': {
            ...this.theme.backgroundColor(this.componentOptions().rowHoverColor),
            cursor: 'pointer',
          },
        }
      );

      this.detailRowClass = css({
        display: 'table-row',
        visibility: 'hidden',
        '&.expanded': {
          visibility: 'visible',
        },
        '& td': {
          padding: 0,
          borderBottom: this.getBorder(this.componentOptions().tdHorizontalBorder),
        },
        '& td .detail-content-wrapper': {
          display: 'grid',
          gridTemplateRows: '0fr',
          transition: 'grid-template-rows 0.3s ease',
          overflow: 'hidden',

          '& .detail-inner': {
            minHeight: 0,
          },
        },
        '&.expanded td .detail-content-wrapper': {
          gridTemplateRows: '1fr',
        },
      });
    });
  }

  // Loading state detection
  isLoading = linkedSignal(() => {
    const datasource = this.datasource();
    if (datasource && datasource instanceof UniServerSideDatasource) {
      // For server-side datasource, use the built-in loading state
      return datasource.isLoading();
    } else {
      // For client-side datasource, no loading state needed
      return false;
    }
  });

  toggleRow(index: number) {
    this.expandedIndex.update((current) => (current === index ? null : index));
  }

  handleRowClick(row: T, index: number) {
    this.rowClick.emit(row);

    this.toggleRow(index);
  }

  isHighlighted(row: T) {
    const callback = this.highlight && this.highlight();
    if (!callback) return false;
    return callback(row);
  }

  protected readonly String = String;

  handleScrollable(scrollable: boolean) {
    this.scrollable.set(scrollable);
  }

  getBorder(name: string | undefined) {
    return name ? this.theme.theme().borders[name] : undefined;
  }
}
