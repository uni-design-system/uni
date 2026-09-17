import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { ColorKey, StyleExpression } from '@uni-design-system/uni-core';
import { visuallyHidden } from '../../cdk';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniTextDirective } from '../text/text.directive';
import type { UniCheckboxOptions, UniCheckboxVariant } from './checkbox.model';

@Component({
  selector: 'uni-checkbox',
  imports: [UniTextDirective],
  templateUrl: './checkbox.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'checkbox' }],
  host: { '[class]': 'hostClass()' },
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
   * Keep `label` as the accessible name, but do not draw it.
   *
   * For the shape where the thing being selected is already on screen beside
   * the box — a table's select column, a row in a list — the name is needed by
   * assistive tech and must not be printed. The string stays in the DOM, so a
   * test querying by label text and a screen reader see the same words.
   */
  readonly labelHidden = input(false, { transform: booleanAttribute });

  /**
   * Stretch the control and its label across the container, making the whole
   * width the hit target. Pair it with projected content for a clickable row.
   */
  readonly fullWidth = input(false, { transform: booleanAttribute });

  /**
   * Mixed state for "select all"-style parent checkboxes. Cleared
   * automatically on the next user interaction, matching native behavior.
   */
  readonly indeterminate = model<boolean>(false);

  // Only show errors if the user has actually interacted with the field
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  markAsTouched() {
    this.touched.set(true);
    this.touch.emit();
  }

  handleChange(event: Event) {
    this.indeterminate.set(false);
    this.checked.set((event.target as HTMLInputElement).checked);
    this.markAsTouched();
  }

  /** Resolved from the component's `motion` option; `control` by default. */
  private readonly motion = computed(() =>
    this.theme.motion(this.componentOptions().motion ?? 'control')
  );

  /** The tick is drawn rather than switched, so it trails the box. */
  private readonly drawMotion = computed(() => this.theme.motion('reveal'));

  /** A visually hidden `label`, still announced and still queryable by text. */
  protected readonly srOnlyClass = css(visuallyHidden);

  /**
   * The host is inline-flex so `<uni-checkbox>` measures the control it
   * contains. Without a display it is inline, and the flex `<label>` inside
   * makes it generate block boxes — so the element filled its container and a
   * checkbox in a narrow grid track could not be sized by measuring it.
   */
  protected readonly hostClass = computed(() =>
    css({
      display: 'inline-flex',
      width: this.fullWidth() ? '100%' : undefined,
    })
  );

  /**
   * Box geometry for the active `size`, read out of the theme's `sizes` block
   * as data — the same treatment `uni-toggle` and `uni-calendar` give theirs.
   *
   * Read from `componentTheme().sizes` rather than through `style()` so a
   * theme's `fixed` or `variants` block cannot leak a stray `height` into the
   * box, which is geometry this component owns.
   */
  private readonly sizeStyle = computed(
    () => (this.componentTheme().sizes?.[this.size()] ?? {}) as StyleExpression
  );

  /**
   * The deprecated global `options.size` still outranks the size block.
   *
   * Themes are deep-merged over the base, so a theme written before 11.2 —
   * which states one number and knows nothing of `sizes` — would otherwise
   * inherit our block and have its own size silently overruled. Deleting that
   * key is how a theme opts into per-size geometry.
   */
  private readonly boxSize = computed(
    () => this.componentOptions().size ?? Number(this.sizeStyle()['height'] ?? 20)
  );

  /** Space between the box and its label, as a spacing token. */
  private readonly gap = computed(() =>
    this.theme.getSpacing(this.componentOptions().gap ?? 'sm')
  );

  protected readonly checkboxLabel = computed(() =>
    css({
      userSelect: 'none',
      cursor: this.disabled() ? 'not-allowed' : 'pointer',
      marginBottom: 0,
      display: 'flex',
      alignItems: 'center',
      gap: this.gap(),
      opacity: this.disabled() ? 0.6 : 1,
      width: this.fullWidth() ? '100%' : undefined,

      '&:hover .checkbox svg path': this.disabled()
        ? {}
        : {
            strokeDashoffset: 0,
          },

      '& .checkbox': {
        height: this.boxSize(),
        width: this.boxSize(),
        flexShrink: 0,
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
        transition: `all ${this.motion().duration}ms ${this.motion().easing}`,
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
        // The tick is drawn (stroke-dashoffset), deliberately trailing the
        // box it lands in, so it reads as a slower `reveal` rather than the
        // `control` beat of the box itself.
        transition: `all ${this.drawMotion().duration}ms ${this.drawMotion().easing}`,
      },

      '& .checkbox svg .checkbox-dash': {
        stroke: this.accent().on,
        strokeWidth: 2,
        strokeLinecap: 'round',
        opacity: 0,
        transition: `opacity ${this.motion().duration}ms ${this.motion().easing}`,
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
