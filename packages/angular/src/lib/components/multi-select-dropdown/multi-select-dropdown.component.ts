import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  signal,
  viewChildren,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import { createListboxNavigation, Option, visuallyHidden, type Options } from '../../cdk';
import { removeInputPlatformStyling } from '@uni-design-system/uni-core';
import { UniBoxDirective, UniRowDirective, UniStackDirective } from '../layout';
import { UniButtonComponent } from '../button/button.component';
import { UniDividerComponent } from '../divider';
import { UniDropdownComponent } from '../dropdown/dropdown.component';
import { UniSymbolComponent } from '../symbol';
import { UniTextDirective } from '../text/text.directive';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniCheckboxComponent } from '../checkbox/checkbox.component';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import { UniMultiSelectDropdownOptions } from './multi-select-dropdown.model';

@Component({
  selector: 'uni-multi-select-dropdown',
  imports: [
    UniCheckboxComponent,
    UniBoxDirective,
    UniDropdownComponent,
    UniStackDirective,
    UniDividerComponent,
    UniButtonComponent,
    UniTextDirective,
    UniSymbolComponent,
    UniRowDirective,
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

  /** Synced from required() validators by the Signal Forms [formField] directive. */
  readonly required = input(false);

  /**
   * Id(s) of external element(s) describing this control — typically your
   * app-rendered error message — exposed as aria-describedby.
   */
  readonly ariaDescribedBy = input<string>();

  // --- CONFIGURATION ---
  readonly options = input.required<Options<T>>();
  readonly placeholder = input<string>('');

  /**
   * What the field is for, e.g. "Fruits". Rendered visually hidden inside the
   * trigger so its accessible name reads "Fruits, Apple, Pear" — without it a
   * screen reader announces only the current selection, with no clue which
   * field it belongs to.
   */
  readonly label = input<string>();

  /** Debounce for the filter box, matching the library's input debounce. */
  readonly debounceTime = input(200);

  protected readonly srOnly = css(visuallyHidden);

  protected readonly query = signal('');
  private queryTimer?: ReturnType<typeof setTimeout>;

  protected readonly filteredOptions = computed<Options<T>>(() => {
    const filterText = this.query().toLowerCase();
    return this.options().filter((opt) => opt.label.toLowerCase().includes(filterText));
  });

  private readonly optionRefs = viewChildren<ElementRef<HTMLElement>>('optionRow');

  /**
   * Roving focus over the options. The shared helper owns the index
   * arithmetic — wrapping, Home/End, and never pointing past a list the
   * filter has narrowed — the same contract `uni-search-input` and
   * `uni-tag-input` use, so the keys behave identically across all three.
   *
   * `disabled` indexes into `filteredOptions`, matching `count`: arrows step
   * over disabled rows and Home/End land on the nearest enabled one, so the
   * focus target is always a checkbox that can actually take focus.
   */
  protected readonly list = createListboxNavigation({
    count: () => this.filteredOptions().length,
    idPrefix: 'uni-multi-select',
    disabled: (index) => !!this.filteredOptions()[index]?.disabled,
    // Focus rides the option checkboxes here, not a text field, so Home/End
    // have no caret to defer to — unlike the combobox-style consumers.
    homeEndNavigates: true,
  });

  /** Announced with the selection so the count is not left to guesswork. */
  readonly selectionSummary = computed(() => {
    const count = this.value().length;
    return count === 0 ? 'none selected' : `${count} selected`;
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
    const text = (event.target as HTMLInputElement).value;
    // Debounced so a long option list is not re-filtered on every keystroke.
    clearTimeout(this.queryTimer);
    this.queryTimer = setTimeout(() => this.query.set(text), this.debounceTime());
  }

  /**
   * Arrow keys walk the options from anywhere in the panel, including the
   * filter box — previously the only way in was to Tab through every
   * checkbox.
   */
  protected onPanelKeydown(event: KeyboardEvent) {
    if (!this.list.navigate(event)) return;
    const row = this.optionRefs()[this.list.activeIndex()]?.nativeElement;
    row?.querySelector<HTMLElement>('input, [tabindex]')?.focus();
  }

  /** Keeps the active index in step when focus lands on a row by pointer. */
  protected onOptionFocus(index: number) {
    this.list.show();
    this.list.setActive(index);
  }

  /**
   * Selects every *enabled* option. A disabled option is not committable, so
   * "select all" must not commit one on the user's behalf — the same rule
   * `toggleOption` and the keyboard path follow.
   */
  selectAll() {
    if (this.disabled()) return;

    this.touched.set(true);
    const allValues = this.options()
      .filter((option) => !option.disabled)
      .map((option) => option.value);
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
    // The nav hook keeps the keyboard off disabled rows; this stops a pointer.
    if (this.disabled() || option.disabled) return;

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
