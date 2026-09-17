import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  model,
  output,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { ColorKey, StyleExpression } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextDirective } from '../text/text.directive';
import type { UniRadioOption, UniRadioOptions, UniRadioVariant } from './radio.model';
import { UniRadioOptionDirective } from './radio-option.directive';
import { uniqueId, visuallyHidden } from '../../cdk';

@Component({
  selector: 'uni-radio',
  imports: [UniTextDirective, NgTemplateOutlet],
  templateUrl: './radio.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'radio' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniRadioComponent
  extends BaseComponent<UniRadioOptions, UniRadioVariant>
  implements FormValueControl<string>
{
  // --- REQUIRED SIGNALS (populated by FormValueControl) ---
  readonly value = model<string>('');
  readonly disabled = input(false);
  readonly touched = model(false);
  /**
   * Angular 22 marks the bound field touched through this output; the
   * `touched` model above is bound inward by the directive and no longer
   * propagates back out. Emitted wherever this control already decided
   * the user was done with it.
   */
  readonly touch = output<void>();
  readonly invalid = input(false);
  readonly dirty = input(false);

  /** Synced from required() validators by the Signal Forms [formField] directive. */
  readonly required = input(false);

  /**
   * Accent colour token, overriding the variant's themed accent for one
   * instance. Mirrors the input of the same name on `uni-checkbox` and
   * `uni-toggle`.
   */
  readonly checkedColor = input<ColorKey>();

  /**
   * Id(s) of external element(s) describing this control — typically your
   * app-rendered error message — exposed as aria-describedby.
   */
  readonly ariaDescribedBy = input<string>();

  // --- CONFIGURATION ---
  readonly options = input<UniRadioOption[]>([]);
  readonly label = input<string>();

  /**
   * Keep `label` as the group's accessible name, but do not draw it. The
   * heading still carries the id `aria-labelledby` points at, so the group
   * keeps its name; only the option rows are visible.
   */
  readonly labelHidden = input(false, { transform: booleanAttribute });

  /** Stretch each option row across the container, so the whole width is the hit target. */
  readonly fullWidth = input(false, { transform: booleanAttribute });

  // Unique default so multiple radio groups on a page never share a name
  readonly name = input<string>(uniqueId('uni-radio-group'));

  /**
   * Per-option content, in place of the plain label string. Instantiated once
   * per option with that option as its context — see
   * {@link UniRadioOptionDirective}.
   */
  protected readonly optionTemplate = contentChild(UniRadioOptionDirective);

  /** Links the group label to the radiogroup container. */
  protected readonly groupLabelId = uniqueId('uni-radio-label');

  // Only show errors if the user has actually interacted with the field
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  markAsTouched() {
    this.touched.set(true);
    this.touch.emit();
  }

  /** A visually hidden group heading, still announced and still queryable by text. */
  protected readonly srOnlyClass = css(visuallyHidden);

  /**
   * Circle geometry for the active `size`, read out of the theme's `sizes`
   * block as data — the same treatment `uni-toggle` and `uni-calendar` give
   * theirs, and read from `componentTheme().sizes` rather than through
   * `style()` so a theme's `fixed` or `variants` block cannot leak a stray
   * `height` into geometry this component owns.
   */
  private readonly sizeStyle = computed(
    () => (this.componentTheme().sizes?.[this.size()] ?? {}) as StyleExpression
  );

  private readonly metrics = computed(() => {
    // The deprecated global `options.size` still outranks the size block:
    // themes are deep-merged over the base, so one written before 11.2 would
    // otherwise inherit our block and have its own number silently overruled.
    const radioSize = this.componentOptions().size || Number(this.sizeStyle()['height'] ?? 20);
    const innerCircleSize = radioSize * 0.6;
    return {
      outerCircleSize: radioSize,
      innerCircleSize,
      innerCircleOffset: (radioSize - innerCircleSize) / 2,
    };
  });

  /**
   * Space between the option rows, and between the heading and the first one.
   * Unset stays at the 12px this has always drawn, which is not a step on the
   * base spacing scale — resolving it as a token would dev-warn on every miss.
   */
  private readonly groupGap = computed(() => {
    const groupGap = this.componentOptions().groupGap;
    return groupGap ? this.theme.getSpacing(groupGap) : 12;
  });

  protected readonly radioGroupClass = computed(() =>
    css({
      display: 'flex',
      flexDirection: 'column',
      gap: this.groupGap(),
    })
  );

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
      gap: this.theme.getSpacing(options.gap ?? 'sm'),
      opacity: this.disabled() ? 0.6 : 1,
      width: this.fullWidth() ? '100%' : undefined,

      '& .radio-button': {
        width: outerCircleSize,
        height: outerCircleSize,
        borderRadius: '50%',
        border: `2px solid ${
          this.disabled()
            ? this.color('on-disabled')
            : this.color(this.componentOptions().ringColor ?? 'outline')
        }`,
        position: 'relative',
        transition: ringTransition,
        backgroundColor: this.color(this.componentOptions().fillColor ?? 'surface'),
        flexShrink: 0,
      },

      '& .radio-inner': {
        width: innerCircleSize,
        height: innerCircleSize,
        borderRadius: '50%',
        backgroundColor: this.accent(),
        position: 'absolute',
        top: innerCircleOffset,
        left: innerCircleOffset,
        transform: 'scale(0)',
        transition: dotTransition,
      },

      '&:hover .radio-button': this.disabled()
        ? {}
        : {
            borderColor: this.accent(),
          },

      '&.disabled': {
        cursor: 'not-allowed',
        opacity: 0.6,

        '& .radio-button': {
          borderColor: this.color('on-disabled'),
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
        borderColor: this.accent(),
      },

      '&:checked + .radio-button .radio-inner': {
        transform: 'scale(1)',
      },

      // The shared, themable focus indicator, keyed off the hidden input.
      '&:focus + .radio-button': {
        ...this.theme.focusRingStyle(this.accent()),
      },
    })
  );

  handleRadioChange(optionValue: string) {
    this.value.set(optionValue);
    this.markAsTouched();
  }

  /**
   * The accent colour, from the theme's variant roles rather than by treating
   * the variant name as a colour token — see `uni-checkbox` for why that had
   * to stop. `primary` is the last resort: a reserved variant name.
   */
  /**
   * A chrome colour by token. Unlike the `getThemeColor` this replaces, there
   * is no silent fallback to primary: these are tokens the theme is required
   * to define, so a miss should be visible rather than disguised.
   */
  private color(token: ColorKey) {
    return this.theme.colors()[token];
  }

  private readonly accent = computed(() => {
    const accent = this.checkedColor() ?? this.variantRoles()?.accent ?? 'primary';
    return this.theme.colors()[accent];
  });
}
