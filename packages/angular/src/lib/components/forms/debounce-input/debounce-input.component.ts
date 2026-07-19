import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { css } from '@emotion/css';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'DebounceInput, uni-debounce-input',
  imports: [],
  templateUrl: './debounce-input.component.html',
})
export class UniDebounceInputComponent {
  inputName = input<string>();
  inputId = input<string>();
  debounceTime = input<number>(400);

  // TODO(v4): rename to valueChange — renaming is breaking
  // eslint-disable-next-line @angular-eslint/no-output-native
  change = output<string>();

  value = signal<string | undefined>(undefined);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastEmitted: string | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.timeoutId) clearTimeout(this.timeoutId);
    });
  }

  handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
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
