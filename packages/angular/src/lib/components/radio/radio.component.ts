import { Component, computed, effect, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { ColorToken } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextComponent } from '../text/text.component';
import type { UniRadioOption, UniRadioOptions } from './radio.model';
import { uniqueId } from '../../cdk';

@Component({
  selector: 'uni-radio, Radio',
  standalone: true,
  imports: [UniTextComponent],
  templateUrl: './radio.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'radio' }],
})
export class UniRadioComponent
  extends BaseComponent<UniRadioOptions>
  implements FormValueControl<string>
{
  radioGroupClass!: string;
  radioOptionClass!: string;
  radioInputClass!: string;

  // --- REQUIRED SIGNALS (populated by FormValueControl) ---
  readonly value = model<string>('');
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);

  // --- CONFIGURATION ---
  readonly options = input<UniRadioOption[]>([]);
  readonly label = input<string>();
  // Unique default so multiple radio groups on a page never share a name
  readonly name = input<string>(uniqueId('uni-radio-group'));

  /** Links the group label to the radiogroup container. */
  protected readonly groupLabelId = uniqueId('uni-radio-label');

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
      const radioSize = this.componentOptions().size || 20;
      const outerCircleSize = radioSize;
      const innerCircleSize = radioSize * 0.6;
      const innerCircleOffset = (radioSize - innerCircleSize) / 2;

      this.radioGroupClass = css({
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      });

      this.radioOptionClass = css({
        userSelect: 'none',
        cursor: this.disabled() ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: this.disabled() ? 0.6 : 1,

        '& .radio-button': {
          width: outerCircleSize,
          height: outerCircleSize,
          borderRadius: '50%',
          border: `2px solid ${this.disabled() ? '#ccc' : '#d0d0d0'}`,
          position: 'relative',
          transition: 'all 0.3s ease',
          backgroundColor: '#fff',
          flexShrink: 0,
        },

        '& .radio-inner': {
          width: innerCircleSize,
          height: innerCircleSize,
          borderRadius: '50%',
          backgroundColor: this.getThemeColor(this.variant()),
          position: 'absolute',
          top: innerCircleOffset,
          left: innerCircleOffset,
          transform: 'scale(0)',
          transition: 'all 0.3s ease',
        },

        '&:hover .radio-button': this.disabled()
          ? {}
          : {
              borderColor: this.getThemeColor(this.variant()),
            },

        '&.disabled': {
          cursor: 'not-allowed',
          opacity: 0.6,

          '& .radio-button': {
            borderColor: '#ccc',
          },
        },
      });

      this.radioInputClass = css({
        position: 'absolute',
        zIndex: -1,
        width: 0,
        height: 0,
        opacity: 0,

        '&:checked + .radio-button': {
          borderColor: this.getThemeColor(this.variant()),
        },

        '&:checked + .radio-button .radio-inner': {
          transform: 'scale(1)',
        },

        '&:focus + .radio-button': {
          outline: `2px solid ${this.getThemeColor(this.variant())}`,
          outlineOffset: '2px',
        },
      });
    });
  }

  handleRadioChange(optionValue: string) {
    this.value.set(optionValue);
    this.markAsTouched();
  }

  getThemeColor(token: ColorToken) {
    const colors = this.theme.colors();
    return colors[token] ? colors[token] : colors['primary'];
  }
}
