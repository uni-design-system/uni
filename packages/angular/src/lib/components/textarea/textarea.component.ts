import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import { ThemeService } from '../../theming';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import type { UniTextareaOptions } from './textarea.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-textarea',
  imports: [UniInputBoxComponent],
  templateUrl: './textarea.component.html',
})
export class UniTextareaComponent implements FormValueControl<string> {
  private theme = inject(ThemeService);

  // --- REQUIRED SIGNALS (populated by FormValueControl) ---
  readonly value = model<string>('');
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
  label = input.required<string>();
  placeholder = input('');
  /** Visible text rows. Defaults to the theme's `textarea` options. */
  rows = input<number | undefined>(undefined);

  private options = this.theme.getComponentOptions<UniTextareaOptions>('textarea');

  protected readonly resolvedRows = computed(() => this.rows() ?? this.options().rows ?? 3);

  // Only show errors if the user has actually interacted with the field
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly textareaClass = computed(() =>
    css({
      width: '100%',
      resize: this.options().resize ?? 'vertical',
    })
  );

  markAsTouched() {
    this.touched.set(true);
  }

  handleInput(event: Event) {
    this.value.set((event.target as HTMLTextAreaElement).value);
  }
}
