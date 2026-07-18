import { Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { Options } from '../../cdk';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import { UniSymbolComponent } from '../symbol';

@Component({
  selector: 'uni-select, SelectInput',
  imports: [UniInputBoxComponent, UniSymbolComponent],
  templateUrl: './select-input.component.html',
})
export class UniSelectComponent<T> implements FormValueControl<T | null> {
  // --- REQUIRED SIGNALS (populated by FormValueControl) ---
  readonly value = model<T | null>(null);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);

  // --- CONFIGURATION ---
  readonly options = input<Options<T>>([]);
  readonly placeholder = input<string>();

  protected readonly UNSELECTED = -1;

  /**
   * We use the index as the HTML value to avoid issues with
   * stringifying complex objects or duplicate labels.
   */
  protected readonly currentSelectedIndex = computed(() => {
    const currentVal = this.value();
    if (currentVal === null || currentVal === undefined) return this.UNSELECTED;

    // Find the index of the option that contains our current value
    const index = this.options().findIndex((opt) => opt.value === currentVal);
    return index.toString();
  });

  protected readonly showError = computed(
    () => this.invalid() && (this.touched() || this.dirty())
  );

  protected handleSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const index = parseInt(select.value, 10);

    if (index === this.UNSELECTED) {
      this.value.set(null);
    } else {
      const selectedOption = this.options()[index];
      // Update the model with the 'value' property of the Option interface
      this.value.set(selectedOption.value);
    }
  }

  selectClass = css({
    '& select': {
      paddingRight: 24, // Prevent arrow from overlapping
      cursor: 'pointer',
      '&::-ms-expand': { display: 'none' },
    },

    [`& select:has(option[value="${this.UNSELECTED}"]:checked)`]: {
      color: 'color-mix(in srgb, currentColor 50%, transparent)',
    },
  });

  arrowClass = css({
    position: 'absolute',
    right: 0,
    pointerEvents: 'none' /* Crucial for clicking through */,
  });
}
