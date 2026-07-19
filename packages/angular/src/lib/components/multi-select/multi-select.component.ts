import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { css } from '@emotion/css';

import { Option } from '../../cdk';
import type { NullableSize } from '@uni-design-system/uni-core';
import { UniBoxComponent } from '../layout';
import { UniCheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'uni-multi-select, MultiSelect',
  imports: [UniCheckboxComponent, UniBoxComponent],
  templateUrl: './multi-select.component.html',
  host: { '[class]': 'className' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniMultiSelectComponent<T = unknown> {
  // Data Inputs
  options = input<Option<T>[]>([]);
  selections = input<T[] | null | undefined>(undefined);
  updates = output<T[] | undefined>();

  // Styling Inputs
  flexDirection = input<'row' | 'row-reverse' | 'column' | 'column-reverse'>('column');
  checkboxGap = input<NullableSize | undefined>('sm');

  protected readonly values = computed<unknown[]>(() => this.selections() || []);

  protected readonly optionsWithSelections = computed<Option<T>[]>(() =>
    this.options().map((option) => ({
      ...option,
      selected: this.values().includes(option.value),
    }))
  );

  protected readonly className = css({ display: 'contents' });

  handleCheck(checked: boolean, value: T) {
    const selections = this.selections();

    if (!selections && !checked) return;

    if (selections && !checked) {
      const filteredSelections = selections.filter((item) => item != value);
      const isEmpty = filteredSelections.length === 0;
      this.updates.emit(isEmpty ? undefined : filteredSelections);
      return;
    }

    if (checked) {
      this.updates.emit([...(selections || []), value]);
      return;
    }
  }

  selectAll() {
    const allValues = this.options().map((option) => option.value);
    this.updates.emit(allValues);
  }

  deselectAll() {
    this.updates.emit(undefined);
  }

  optionWrapper = css({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  });
}
