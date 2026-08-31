import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import type { UniInputMode, UniInputType } from './input.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  /** Synced from required() validators by the Signal Forms [formField] directive. */
  readonly required = input(false);

  /**
   * Id(s) of external element(s) describing this control — typically your
   * app-rendered error message — exposed as aria-describedby.
   */
  readonly ariaDescribedBy = input<string>();

  // --- CONFIGURATION ---
  label = input.required<string>();
  placeholder = input('');

  /**
   * Native input type. Text-like types only — `date`/`time` have dedicated
   * components, and non-text types break the input chrome and the string value.
   */
  type = input<UniInputType>('text');

  // --- CONSTRAINTS ---
  // These are Signal Forms' own optional control inputs, so the `[formField]`
  // directive syncs them from the field's validators the same way it syncs
  // `required` — and they are reflected onto the native element so the browser
  // can do its part (number steppers, length limits, on-screen keyboards).
  readonly readonly = input(false);
  readonly name = input('');
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly minLength = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);
  /**
   * Patterns the value must match — all of them, per Signal Forms. The native
   * `pattern` attribute can only express one, so it is reflected only when
   * there is exactly one; Signal Forms validates the rest either way.
   */
  readonly pattern = input<readonly RegExp[]>([]);

  // --- NATIVE ATTRIBUTE PASSTHROUGHS ---
  // The rest of what the platform already does well. Bound as attributes, so
  // an unset input emits nothing at all.
  /** Granularity for `type="number"`, e.g. `0.01` or `'any'`. */
  step = input<number | string>();
  /** Autofill hint, e.g. `email`, `current-password`, `off`. */
  autocomplete = input<string>();
  /** On-screen keyboard hint; defaults to whatever `type` implies. */
  inputMode = input<UniInputMode>();
  /** Id of a `<datalist>` supplying suggestions. */
  list = input<string>();
  spellcheck = input<boolean>();

  /** Reflected only when unambiguous — see `pattern`. */
  protected readonly nativePattern = computed(() => {
    const patterns = this.pattern();
    return patterns.length === 1 ? patterns[0].source : null;
  });

  // --- SIZING (forwarded to uni-input-box) ---
  width = input<string | number | undefined>(undefined);
  fullWidth = input<boolean>(false);
  grow = input<number | undefined>(undefined);

  // Only show errors if the user has actually interacted with the field
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  markAsTouched() {
    this.touched.set(true);
  }

  handleInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }

  inputClass = css({});
}
