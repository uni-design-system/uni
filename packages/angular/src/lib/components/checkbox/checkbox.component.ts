import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { ColorKey } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextDirective } from '../text/text.directive';
import type { UniCheckboxOptions, UniCheckboxVariant } from './checkbox.model';

@Component({
  selector: 'uni-checkbox',
  imports: [UniTextDirective],
  templateUrl: './checkbox.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'checkbox' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniCheckboxComponent
  extends BaseComponent<UniCheckboxOptions, UniCheckboxVariant>
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
   * Accent colour token, overriding the variant's themed accent for one
   * instance. Mirrors `uni-toggle`'s input of the same name — it exists because
   * `variant` defaults to `'primary'`, so the component cannot tell "set to
   * primary" from "not set".
   */
  readonly checkedColor = input<ColorKey>();

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
        fill: this.boxColor(),
        stroke: this.accent().fill,
        strokeWidth: 2,
        rx: this.componentOptions().borderRadius || 2,
        ry: this.componentOptions().borderRadius || 2,
        transition: 'all 0.2s ease',
      },

      // Check/dash draw on the variant-filled box, so they wear its on-color.
      '& .checkbox svg .checkbox-check': {
        fill: 'none',
        stroke: this.accent().on,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeDasharray: 18,
        strokeDashoffset: 18,
        transition: 'all 0.5s ease',
      },

      '& .checkbox svg .checkbox-dash': {
        stroke: this.accent().on,
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
        borderColor: this.accent().fill,
      },

      '&:checked + .checkbox svg .checkbox-box': {
        fill: this.accent().fill,
      },

      '&:checked + .checkbox svg .checkbox-check': {
        strokeDashoffset: 0,
      },

      '&:indeterminate + .checkbox svg .checkbox-box': {
        fill: this.accent().fill,
      },

      '&:indeterminate + .checkbox svg .checkbox-dash': {
        opacity: 1,
      },

      '&:disabled + .checkbox': {
        cursor: 'not-allowed',
      },

      // The shared, themable focus indicator, keyed off the hidden input's
      // focus. The ring sits out from the box, so its radius carries an extra
      // 4px to round proportionally (as the original hand-drawn ring did) —
      // without it the corners gap away from the box.
      '&:focus + .checkbox': {
        ...this.theme.focusRingStyle(
          this.accent().fill,
          this.componentOptions().focusRingGap
        ),
        borderRadius: `${(Number(this.componentOptions().borderRadius) || 2) + 2}px`,
      },
    })
  );

  /**
   * The accent and its paired content colour, from the theme's variant roles.
   *
   * Previously the variant *name* was looked up as a colour token, which held
   * together only because every variant happened to also be a colour. With the
   * registry open that coincidence ends by design: `variant="destructive"`
   * would have missed and silently rendered primary. The theme now says which
   * colour draws the intent, and an unthemed variant warns rather than lying.
   *
   * `primary` is the last resort because it is a reserved variant name — the
   * default every component inherits.
   */
  private readonly accent = computed(() => {
    const colors = this.theme.colors();
    const roles = this.variantRoles();
    const accent = this.checkedColor() ?? roles?.accent ?? 'primary';
    const onAccent = roles?.onAccent ?? (`on-${accent}` as ColorKey);
    return { fill: colors[accent], on: colors[onAccent] };
  });

  protected readonly boxColor = computed(
    () => this.theme.colors()[this.componentOptions().boxColor ?? 'surface']
  );
}
