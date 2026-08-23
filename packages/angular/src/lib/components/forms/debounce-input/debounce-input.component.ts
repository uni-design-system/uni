import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { css } from '@emotion/css';
import { UniInputBoxComponent } from '../../input-box/input-box.component';
import type { UniInputMode, UniInputType } from '../../input/input.types';

/**
 * Text input that emits `change` only after the user pauses typing. Wears the
 * shared input chrome (themed color, border, typeface, focus ring) via
 * `uni-input-box`; project adornments with the `pre-input` / `post-input`
 * slots, matching `uni-input`'s convention. The ARIA passthrough inputs let a
 * wrapping composite (e.g. SearchInput's combobox) annotate the real input
 * element.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-debounce-input',
  imports: [UniInputBoxComponent],
  templateUrl: './debounce-input.component.html',
})
export class UniDebounceInputComponent {
  inputName = input<string>();
  inputId = input<string>();
  debounceTime = input<number>(400);
  /** Accessible name for the input. */
  label = input<string>();
  placeholder = input('');
  disabled = input(false);
  /** Native input type; text-like only, matching `uni-input`. */
  type = input<UniInputType>('text');
  autocomplete = input<string>();
  inputMode = input<UniInputMode>();

  // ARIA passthroughs for composite widgets (combobox etc.).
  role = input<string>();
  ariaExpanded = input<boolean | undefined>(undefined);
  ariaControls = input<string>();
  ariaActivedescendant = input<string>();

  // TODO(v4): rename to valueChange — renaming is breaking
  // eslint-disable-next-line @angular-eslint/no-output-native
  change = output<string>();

  value = signal<string | undefined>(undefined);

  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('field');
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

  /** Empty the field immediately, cancelling any pending emit. */
  clear() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.value.set('');
    if (this.lastEmitted !== '') {
      this.lastEmitted = '';
      this.change.emit('');
    }
  }

  focus() {
    this.inputElement().nativeElement.focus();
  }

  inputClass = css({
    flexGrow: 1,
    width: '100%',
    minWidth: 0,
  });
}
