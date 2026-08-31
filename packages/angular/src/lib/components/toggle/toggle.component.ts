import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { ColorKey, ColorToken } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextDirective } from '../text/text.directive';
import type { UniToggleOptions } from './toggle.model';

/**
 * Everything a switch needs, from the three numbers a theme actually states.
 *
 * `travel` is why this is derived rather than written down: the knob starts at
 * `inset` and must end the same distance from the far edge, so it moves
 * `width - inset - knob - inset`, which reduces to `width - height`. The old
 * code hardcoded a translate of one track height, which was correct only while
 * the width was locked at 2x and the knob at 0.8x.
 */
function geometry(width: number, height: number, inset: number) {
  return { width, height, inset, knob: height - inset * 2, travel: width - height, radius: height / 2 };
}

@Component({
  selector: 'uni-toggle',
  imports: [UniTextDirective],
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

  /** Synced from required() validators by the Signal Forms [formField] directive. */
  readonly required = input(false);

  /**
   * Id(s) of external element(s) describing this control — typically your
   * app-rendered error message — exposed as aria-describedby.
   */
  readonly ariaDescribedBy = input<string>();

  // --- CONFIGURATION ---
  readonly label = input<string>();

  /**
   * Checked-state track color token, overriding the theme's
   * `toggle.behavior.checkedColor`.
   *
   * This exists alongside the theme option because `variant` — where this color
   * used to live exclusively — defaults to `'primary'`, so the component cannot
   * tell "set to primary" from "not set". Without an input, a theme-level
   * `checkedColor` would silently make per-instance `variant` inert.
   */
  readonly checkedColor = input<ColorKey>();

  // Only show errors if the user has actually interacted with the field
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  markAsTouched() {
    this.touched.set(true);
  }

  handleChange(event: Event) {
    this.checked.set((event.target as HTMLInputElement).checked);
    this.markAsTouched();
  }

  /**
   * Track and knob geometry for the active `size`, read out of the theme's
   * `sizes` block as data — `width`, `height` and the knob's inset `padding`.
   *
   * Read rather than spread: `padding` must not reach the track as real CSS or
   * it would double up with the knob's own `top`/`left` offsets. `uni-calendar`
   * treats its size block the same way.
   */
  private readonly metrics = computed(() => {
    // The legacy single-number token wins when a theme still sets it: that
    // theme opted into the old derived-ratio geometry before `sizes` existed,
    // and it applies to every instance regardless of the `size` input.
    const legacy = this.componentOptions().size;
    if (legacy != null) {
      const height = Number(legacy);
      return geometry(height * 2, height, (height - height * 0.8) / 2);
    }

    const size = this.style();
    const height = Number(size['height'] ?? 20);
    const width = Number(size['width'] ?? height * 2);
    const inset = Number(size['padding'] ?? (height - height * 0.8) / 2);
    return geometry(width, height, inset);
  });

  /** The resolved checked/accent color: input, then theme option, then variant. */
  private readonly accent = computed(
    () => this.checkedColor() ?? this.componentOptions().checkedColor ?? this.variant()
  );

  /** Knob slide and track color change, as a motion token — never `all`. */
  private readonly transitions = computed(() => {
    const motion = this.theme.motion(this.componentOptions().motion ?? 'control');
    const speed = motion.duration / 1000;
    return {
      // Scoped, never `all`: the focus ring must apply instantly rather than
      // interpolating its outline color from a stale value.
      track: `background-color ${speed}s ${motion.easing}, border-color ${speed}s ${motion.easing}`,
      knob: `transform ${speed}s ${motion.easing}, background-color ${speed}s ${motion.easing}`,
    };
  });

  protected readonly toggleLabel = computed(() => {
    const { height, width, knob, inset, radius } = this.metrics();
    return css({
      userSelect: 'none',
      cursor: this.disabled() ? 'not-allowed' : 'pointer',
      marginBottom: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      opacity: this.disabled() ? 0.6 : 1,

      '& .toggle-switch': {
        width,
        height,
        backgroundColor: this.disabled()
          ? this.getThemeColor('disabled')
          : this.getThemeColor(this.componentOptions().trackColor ?? 'surface-variant'),
        borderRadius: radius,
        position: 'relative',
        transition: this.transitions().track,
      },

      '& .toggle-slider': {
        width: knob,
        height: knob,
        backgroundColor: this.getThemeColor(this.componentOptions().knobColor ?? 'surface'),
        borderRadius: '50%',
        position: 'absolute',
        top: inset,
        left: inset,
        transition: this.transitions().knob,
        ...this.theme.boxShadow('raised'),
      },

      // Hover darkens whatever the token resolves to — the button convention.
      '&:hover .toggle-switch': this.disabled()
        ? {}
        : {
            filter: 'brightness(0.95)',
          },
    });
  });

  protected readonly toggleInput = computed(() => {
    const { travel } = this.metrics();
    const accent = this.getThemeColor(this.accent());
    return css({
      position: 'absolute',
      zIndex: -1,
      width: 0,
      height: 0,
      opacity: 0,

      '&:checked + .toggle-switch': {
        backgroundColor: accent,
        borderColor: accent,
      },

      '&:checked + .toggle-switch .toggle-slider': {
        transform: `translateX(${travel}px)`,
      },

      '&:disabled + .toggle-switch': {
        cursor: 'not-allowed',
      },

      // The shared, themable focus indicator, keyed off the hidden input. It
      // wears the checked color rather than the variant, so a themed on-state
      // is not paired with a ring in some other role's color.
      '&:focus + .toggle-switch': {
        ...this.theme.focusRingStyle(accent),
      },
    });
  });

  getThemeColor(token: ColorToken) {
    const colors = this.theme.colors();
    return colors[token] ? colors[token] : colors['primary'];
  }
}
