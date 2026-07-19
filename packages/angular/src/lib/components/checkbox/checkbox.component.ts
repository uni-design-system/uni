import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { ColorToken } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextComponent } from '../text/text.component';
import type { UniCheckboxOptions } from './checkbox.model';

@Component({
  selector: 'uni-checkbox, Checkbox',
  imports: [UniTextComponent],
  templateUrl: './checkbox.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'checkbox' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniCheckboxComponent
  extends BaseComponent<UniCheckboxOptions>
  implements FormCheckboxControl
{
  // --- REQUIRED SIGNALS (populated by FormCheckboxControl) ---
  readonly checked = model<boolean>(false);
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
  readonly label = input<string>();

  /**
   * Mixed state for "select all"-style parent checkboxes. Cleared
   * automatically on the next user interaction, matching native behavior.
   */
  readonly indeterminate = model<boolean>(false);

  // Only show errors if the user has actually interacted with the field
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  markAsTouched() {
    this.touched.set(true);
  }

  handleChange(event: Event) {
    this.indeterminate.set(false);
    this.checked.set((event.target as HTMLInputElement).checked);
    this.markAsTouched();
  }

  protected readonly checkboxLabel = computed(() =>
    css({
      userSelect: 'none',
      cursor: this.disabled() ? 'not-allowed' : 'pointer',
      marginBottom: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      opacity: this.disabled() ? 0.6 : 1,

      '&:hover .checkbox svg path': this.disabled()
        ? {}
        : {
            strokeDashoffset: 0,
          },

      '& .checkbox': {
        height: this.componentOptions().size,
        width: this.componentOptions().size,
      },

      '& .checkbox svg': {
        display: 'block',
      },

      '& .checkbox svg .checkbox-box': {
        fill: '#FFF',
        stroke: this.getThemeColor(this.variant()),
        strokeWidth: 2,
        rx: this.componentOptions().borderRadius || 2,
        ry: this.componentOptions().borderRadius || 2,
        transition: 'all 0.2s ease',
      },

      '& .checkbox svg .checkbox-check': {
        fill: 'none',
        stroke: '#FFF',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeDasharray: 18,
        strokeDashoffset: 18,
        transition: 'all 0.5s ease',
      },

      '& .checkbox svg .checkbox-dash': {
        stroke: '#FFF',
        strokeWidth: 2,
        strokeLinecap: 'round',
        opacity: 0,
        transition: 'opacity 0.2s ease',
      },
    })
  );

  protected readonly checkboxInput = computed(() =>
    css({
      position: 'absolute',
      zIndex: -1,
      width: 0,
      height: 0,
      opacity: 0,

      '&:checked + .checkbox': {
        borderColor: this.getThemeColor(this.variant()),
      },

      '&:checked + .checkbox svg .checkbox-box': {
        fill: this.getThemeColor(this.variant()),
      },

      '&:checked + .checkbox svg .checkbox-check': {
        strokeDashoffset: 0,
      },

      '&:indeterminate + .checkbox svg .checkbox-box': {
        fill: this.getThemeColor(this.variant()),
      },

      '&:indeterminate + .checkbox svg .checkbox-dash': {
        opacity: 1,
      },

      '&:disabled + .checkbox': {
        cursor: 'not-allowed',
      },

      '&:focus + .checkbox': {
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-4px',
          left: '-4px',
          right: '-4px',
          bottom: '-4px',
          border: `2px solid ${this.getThemeColor(this.variant())}`,
          borderRadius: `${(Number(this.componentOptions().borderRadius) || 2) + 4}px`,
          pointerEvents: 'none',
        },
      },
    })
  );

  getThemeColor(token: ColorToken) {
    const colors = this.theme.colors();
    return colors[token] ? colors[token] : colors['primary'];
  }
}
