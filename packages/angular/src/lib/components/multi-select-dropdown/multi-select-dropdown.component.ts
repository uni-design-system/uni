import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import { Option, type Options } from '../../cdk';
import { removeInputPlatformStyling } from '@uni-design-system/uni-core';
import { UniBoxComponent, UniRowComponent, UniStackComponent } from '../layout';
import { UniButtonComponent } from '../button/button.component';
import { UniDividerComponent } from '../divider';
import { UniDropdownComponent } from '../dropdown/dropdown.component';
import { UniSymbolComponent } from '../symbol';
import { UniTextComponent } from '../text/text.component';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniCheckboxComponent } from '../checkbox/checkbox.component';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import { UniMultiSelectDropdownOptions } from './multi-select-dropdown.model';

@Component({
  selector: 'uni-multi-select-dropdown, MultiSelectDropdown',
  imports: [
    UniCheckboxComponent,
    UniBoxComponent,
    UniDropdownComponent,
    UniStackComponent,
    UniDividerComponent,
    UniButtonComponent,
    UniTextComponent,
    UniSymbolComponent,
    UniRowComponent,
    UniInputBoxComponent,
  ],
  templateUrl: './multi-select-dropdown.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'multiSelectDropdown' }],
  host: { '[class]': 'className' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniMultiSelectDropdownComponent<T = unknown>
  extends BaseComponent<UniMultiSelectDropdownOptions>
  implements FormValueControl<T[]>
{
  protected readonly className = css({ display: 'contents' });

  // --- REQUIRED SIGNALS (populated by FormValueControl) ---
  readonly value = model<T[]>([]);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);

  /** Synced from required() validators by the Signal Forms [field] directive. */
  readonly required = input(false);

  /**
   * Id(s) of external element(s) describing this control — typically your
   * app-rendered error message — exposed as aria-describedby.
   */
  readonly ariaDescribedBy = input<string>();

  // --- CONFIGURATION ---
  readonly options = input.required<Options<T>>();
  readonly placeholder = input<string>('');

  protected readonly query = signal('');

  protected readonly filteredOptions = computed<Options<T>>(() => {
    const filterText = this.query().toLowerCase();
    return this.options().filter((opt) => opt.label.toLowerCase().includes(filterText));
  });

  // Derived display string
  readonly selectedLabelsText = computed(() => {
    const selections = this.value();
    const allOptions = this.options();

    // Find labels for each selected ID
    const labels = selections
      .map((value) => allOptions.find((opt) => opt.value === value)?.label)
      .filter((label) => !!label); // Remove undefined if an ID isn't found

    return labels.length > 0 ? labels.join(', ') : this.placeholder();
  });

  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly textColor = computed(() => {
    return this.selectedLabelsText() === this.placeholder()
      ? this.componentOptions().placeholderTextColor
      : this.componentOptions().textColor;
  });

  triggerClass = css({
    all: 'unset',
    display: 'block',
    cursor: 'pointer',
    width: '100%',

    '&:focus > :first-child > :first-child': {
      outline: this.componentOptions().focusOutline,
      outlineOffset: this.componentOptions().focusOutlineOffset,
    },
  });

  protected readonly searchInputClass = computed(() =>
    css({
      ...removeInputPlatformStyling,
      ...this.theme.border(this.componentOptions().searchInputBorder),
      ...this.theme.radius(this.componentOptions().searchInputBorderRadius),
      paddingBlock: 4,
      paddingInline: 8,
      width: 'auto',

      '&:focus': {
        outline: this.componentOptions().focusOutline,
        outlineOffset: this.componentOptions().focusOutlineOffset,
      },
    })
  );

  protected handleQueryInput(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
  }

  selectAll() {
    if (this.disabled()) return;

    this.touched.set(true);
    const allValues = this.options().map((option) => option.value);
    this.value.set(allValues);
  }

  deselectAll() {
    if (this.disabled()) return;

    this.touched.set(true);
    this.value.set([]);
  }

  protected isOptionSelected(option: Option<T>) {
    return computed(() => this.value().includes(option.value));
  }

  toggleOption(option: Option<T>, checked: boolean) {
    if (this.disabled()) return;

    this.touched.set(true);
    const { value } = option;
    this.value.update((current) => {
      if (checked) {
        // Add selection if not already present
        return current.includes(value) ? current : [...current, value];
      } else {
        // Remove selection
        return current.filter((item) => item !== value);
      }
    });
  }
}
