import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { ColorToken } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextComponent } from '../text/text.component';
import type { UniToggleOptions } from './toggle.model';

@Component({
  selector: 'uni-toggle, Toggle',
  imports: [UniTextComponent],
  templateUrl: './toggle.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'toggle' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniToggleComponent
  extends BaseComponent<UniToggleOptions>
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

  // Only show errors if the user has actually interacted with the field
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  markAsTouched() {
    this.touched.set(true);
  }

  handleChange(event: Event) {
    this.checked.set((event.target as HTMLInputElement).checked);
    this.markAsTouched();
  }

  private readonly metrics = computed(() => {
    const toggleSize = (this.componentOptions().size as number) || 20;
    const sliderSize = toggleSize * 0.8;
    return {
      toggleSize,
      toggleWidth: toggleSize * 2,
      sliderSize,
      sliderOffset: (toggleSize - sliderSize) / 2,
    };
  });

  protected readonly toggleLabel = computed(() => {
    const { toggleSize, toggleWidth, sliderSize, sliderOffset } = this.metrics();
    return css({
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
  });

  protected readonly toggleInput = computed(() => {
    const { toggleSize } = this.metrics();
    return css({
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

  getThemeColor(token: ColorToken) {
    const colors = this.theme.colors();
    return colors[token] ? colors[token] : colors['primary'];
  }
}
