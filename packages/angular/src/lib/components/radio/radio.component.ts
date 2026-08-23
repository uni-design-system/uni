import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { ColorToken } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextDirective } from '../text/text.directive';
import type { UniRadioOption, UniRadioOptions } from './radio.model';
import { uniqueId } from '../../cdk';

@Component({
  selector: 'uni-radio',
  imports: [UniTextDirective],
  templateUrl: './radio.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'radio' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniRadioComponent
  extends BaseComponent<UniRadioOptions>
  implements FormValueControl<string>
{
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
  readonly options = input<UniRadioOption[]>([]);
  readonly label = input<string>();
  // Unique default so multiple radio groups on a page never share a name
  readonly name = input<string>(uniqueId('uni-radio-group'));

  /** Links the group label to the radiogroup container. */
  protected readonly groupLabelId = uniqueId('uni-radio-label');

  // Only show errors if the user has actually interacted with the field
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  markAsTouched() {
    this.touched.set(true);
  }

  private readonly metrics = computed(() => {
    const radioSize = (this.componentOptions().size as number) || 20;
    const innerCircleSize = radioSize * 0.6;
    return {
      outerCircleSize: radioSize,
      innerCircleSize,
      innerCircleOffset: (radioSize - innerCircleSize) / 2,
    };
  });

  protected readonly radioGroupClass = css({
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  });

  protected readonly radioOptionClass = computed(() => {
    const { outerCircleSize, innerCircleSize, innerCircleOffset } = this.metrics();
    // The dot's grow/retract is a token: 0.3s default, 0 = instant. The
    // transitions are scoped — never `all` — so the focus ring's outline and
    // shadow apply instantly instead of interpolating from a stale outline
    // color, which flashed a dark ring before the themed ring color landed.
    const options = this.componentOptions();
    const motion = this.theme.motion(options.motion ?? 'control');
    const speed = motion.duration / 1000;
    const ringTransition = `border-color ${speed}s ${motion.easing}, background-color ${speed}s ${motion.easing}`;
    const dotTransition = `transform ${speed}s ${motion.easing}`;
    return css({
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
        border: `2px solid ${
          this.disabled()
            ? this.getThemeColor('on-disabled')
            : this.getThemeColor(this.componentOptions().ringColor ?? 'outline')
        }`,
        position: 'relative',
        transition: ringTransition,
        backgroundColor: this.getThemeColor(this.componentOptions().fillColor ?? 'surface'),
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
        transition: dotTransition,
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
          borderColor: this.getThemeColor('on-disabled'),
        },
      },
    });
  });

  protected readonly radioInputClass = computed(() =>
    css({
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

      // The shared, themable focus indicator, keyed off the hidden input.
      '&:focus + .radio-button': {
        ...this.theme.focusRingStyle(this.getThemeColor(this.variant())),
      },
    })
  );

  handleRadioChange(optionValue: string) {
    this.value.set(optionValue);
    this.markAsTouched();
  }

  getThemeColor(token: ColorToken) {
    const colors = this.theme.colors();
    return colors[token] ? colors[token] : colors['primary'];
  }
}
