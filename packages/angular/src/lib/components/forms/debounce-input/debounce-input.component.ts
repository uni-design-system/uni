import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { css } from '@emotion/css';

@Component({
  selector: 'DebounceInput, uni-debounce-input',
  standalone: true,
  imports: [],
  templateUrl: './debounce-input.component.html',
})
export class UniDebounceInputComponent {
  inputName = input<string>();
  inputId = input<string>();
  debounceTime = input<number>(400);

  change = output<string>();

  value = signal<string | undefined>(undefined);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastEmitted: string | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.timeoutId) clearTimeout(this.timeoutId);
    });
  }

  handleInput(value: string) {
    this.value.set(value);

    // Debounce, emitting only when the value actually changed.
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      if (value !== this.lastEmitted) {
        this.lastEmitted = value;
        this.change.emit(value);
      }
    }, this.debounceTime());
  }

  inputClass = css({
    border: 'none',
    fontSize: 18,
    width: '100%',

    '&:focus-visible': {
      outline: 'none',
    },
  });
}
