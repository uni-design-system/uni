import { Component, effect, input, signal } from '@angular/core';
import { css } from '@emotion/css';
import { UniDatasource, UniRecordDatasource, UniServerSideDatasource } from '../../cdk';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniIconComponent } from '../icon';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniCenterComponent, UniRowComponent } from '../layout';
import type { UniDataSearchOptions } from './data-search.model';

@Component({
  selector: 'uni-data-search',
  imports: [UniRowComponent, UniIconButtonComponent, UniIconComponent, UniCenterComponent],
  templateUrl: './data-search.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'dataSearch' }],
})
export class UniDataSearchComponent<T> extends BaseComponent<UniDataSearchOptions> {
  datasource = input<UniDatasource<T>>();
  placeholder = input<string>('Search');
  fields = input<string[]>();

  searchValue = signal('');

  inputClassName!: string;

  constructor() {
    super();

    effect(() => {
      this.inputClassName = css({
        border: 'none',
        padding: 0,
        fontSize: 16,
        flexGrow: 1,
        height: 18,

        '&:focus-visible': {
          outline: 'none',
        },

        '&::placeholder': {
          ...this.theme.color(this.componentOptions().placeholderColor),
        },
      });
    });
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
    this.filterData(value);
  }

  filterData(value: string) {
    const datasource = this.datasource();
    if (!datasource) return;

    const fields = this.fields();

    if (datasource instanceof UniRecordDatasource) {
      // Client-side filtering with predicate function
      datasource.setFilter((object) => {
        let searchObject = object;
        if (fields && fields.length > 0) {
          searchObject = pick(object as Record<string, unknown>, fields) as T;
        }

        return Object.values(searchObject as object)
          .join(' ')
          .toLowerCase()
          .includes(value.toLowerCase());
      });
    } else if (datasource instanceof UniServerSideDatasource) {
      // Server-side filtering with filter object
      const filterObject: Record<string, unknown> = {};

      if (fields && fields.length > 0) {
        // Apply search to specific fields
        fields.forEach((field) => {
          filterObject[field] = value;
        });
      } else {
        // Generic search filter
        filterObject['search'] = value;
      }

      datasource.setFilter(filterObject);
    }
  }

  clearFilter() {
    const datasource = this.datasource();
    if (!datasource) return;

    if (datasource instanceof UniRecordDatasource) {
      datasource.setFilter(() => true);
    } else if (datasource instanceof UniServerSideDatasource) {
      datasource.clearFilter();
    }

    this.searchValue.set('');
  }
}

function pick(obj: Record<string, unknown>, keys: string[]) {
  return keys.reduce<Record<string, unknown>>((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}
