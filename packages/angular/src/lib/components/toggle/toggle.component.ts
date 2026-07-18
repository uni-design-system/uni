import { Component, computed, effect, input, model } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { ColorToken } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextComponent } from '../text/text.component';
import type { UniToggleOptions } from './toggle.model';

@Component({
  selector: 'uni-toggle, Toggle',
  standalone: true,
  imports: [UniTextComponent],
  templateUrl: './toggle.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'toggle' }],
})
export class UniToggleComponent
  extends BaseComponent<UniToggleOptions>
  implements FormCheckboxControl
{
  toggleLabel!: string;
  toggleInput!: string;

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
      const toggleSize = this.componentOptions().size || 20;
      const toggleWidth = toggleSize * 2;
      const sliderSize = toggleSize * 0.8;
      const sliderOffset = (toggleSize - sliderSize) / 2;

      this.toggleLabel = css({
        userSelect: 'none',
        cursor: this.disabled() ? 'not-allowed' : 'pointer',
        marginBottom: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: this.disabled() ? 0.6 : 1,

        '& .toggle-switch': {
          width: toggleWidth,
          height: toggleSize,
          backgroundColor: this.disabled() ? '#ccc' : '#e0e0e0',
          borderRadius: toggleSize / 2,
          position: 'relative',
          transition: 'all 0.3s ease',
        },

        '& .toggle-slider': {
          width: sliderSize,
          height: sliderSize,
          backgroundColor: '#fff',
          borderRadius: '50%',
          position: 'absolute',
          top: sliderOffset,
          left: sliderOffset,
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        },

        '&:hover .toggle-switch': this.disabled()
          ? {}
          : {
              backgroundColor: '#d0d0d0',
            },
      });

      this.toggleInput = css({
        position: 'absolute',
        zIndex: -1,
        width: 0,
        height: 0,
        opacity: 0,

        '&:checked + .toggle-switch': {
          backgroundColor: this.getThemeColor(this.variant()),
          borderColor: this.getThemeColor(this.variant()),
        },

        '&:checked + .toggle-switch .toggle-slider': {
          transform: `translateX(${toggleSize}px)`,
        },

        '&:disabled + .toggle-switch': {
          cursor: 'not-allowed',
        },

        '&:focus + .toggle-switch': {
          outline: `2px solid ${this.getThemeColor(this.variant())}`,
          outlineOffset: '2px',
        },
      });
    });
  }

  getThemeColor(token: ColorToken) {
    const colors = this.theme.colors();
    return colors[token] ? colors[token] : colors['primary'];
  }
}
