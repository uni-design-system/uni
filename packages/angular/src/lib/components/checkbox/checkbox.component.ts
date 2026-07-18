import { Component, computed, effect, input, model } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { ColorToken } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextComponent } from '../text/text.component';
import type { UniCheckboxOptions } from './checkbox.model';

@Component({
  selector: 'uni-checkbox, Checkbox',
  standalone: true,
  imports: [UniTextComponent],
  templateUrl: './checkbox.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'checkbox' }],
})
export class UniCheckboxComponent
  extends BaseComponent<UniCheckboxOptions>
  implements FormCheckboxControl
{
  checkboxLabel!: string;
  checkboxInput!: string;

  // --- REQUIRED SIGNALS (populated by FormCheckboxControl) ---
  readonly checked = model<boolean>(false);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);

  // --- CONFIGURATION ---
  readonly label = input<string>();

  // Only show errors if the user has actually interacted with the field
  protected readonly showError = computed(
    () => this.invalid() && (this.touched() || this.dirty())
  );

  markAsTouched() {
    this.touched.set(true);
  }

  constructor() {
    super();

    effect(() => {
      this.checkboxLabel = css({
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
      });

      this.checkboxInput = css({
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
      });
    });
  }

  getThemeColor(token: ColorToken) {
    const colors = this.theme.colors();
    return colors[token] ? colors[token] : colors['primary'];
  }
}
