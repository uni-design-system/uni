import { Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import { UniInputBoxComponent } from '../input-box/input-box.component';

@Component({
  selector: 'uni-input',
  imports: [UniInputBoxComponent],
  templateUrl: './input.component.html',
})
export class UniInputComponent implements FormValueControl<string> {
  // --- REQUIRED SIGNALS (populated by FormValueControl) ---
  readonly value = model<string>('');
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);

  // --- CONFIGURATION ---
  label = input.required<string>();
  placeholder = input('');

  // Only show errors if the user has actually interacted with the field
  protected readonly showError = computed(
    () => this.invalid() && (this.touched() || this.dirty())
  );

  markAsTouched() {
    this.touched.set(true);
  }

  inputClass = css({});
}
