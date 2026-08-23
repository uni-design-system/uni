import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';
import { removeInputPlatformStyling } from '@uni-design-system/uni-core';
import { BaseComponent } from '../base';
import { COMPONENT_NAME } from '../base/base.component';
import { UniRowDirective } from '../layout';
import type { UniInputBoxOptions } from './input-box.model';

@Component({
  selector: 'uni-input-box',
  imports: [UniRowDirective],
  templateUrl: './input-box.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'input' }],
  host: { '[class]': 'className' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniInputBoxComponent extends BaseComponent<UniInputBoxOptions> {
  protected readonly className = css({ display: 'contents' });

  disabled = input<boolean>(false);
  error = input<boolean>(false);
  minWidth = input<string>('0');
  /** Override the themed field height, e.g. `'auto'` for multi-line fields. */
  height = input<string | number | undefined>(undefined);

  // Sizing passthroughs. The host is `display: contents`, so width and layout
  // set on `<uni-input-box>` itself would be dropped; these reach the real
  // field element instead, which is what a call site actually wants.
  width = input<string | number | undefined>(undefined);
  fullWidth = input<boolean>(false);
  grow = input<number | undefined>(undefined);

  protected readonly color = computed(() =>
    this.error() ? this.componentOptions().errorColor : this.componentOptions().color
  );

  protected readonly border = computed(() =>
    this.error() ? this.componentOptions().errorBorder : this.componentOptions().border
  );

  protected readonly shadow = computed(() =>
    this.error() ? this.componentOptions().errorShadow : this.componentOptions().shadow
  );

  protected readonly inputBoxClass = computed(() =>
    css([
      this.disabled() && {
        ...this.theme.color(this.componentOptions().disabledTextColor),
        ...this.theme.backgroundColor(this.componentOptions().disabledColor),
        cursor: 'not-allowed !important',
      },
      {
        '& input, select, textarea': {
          ...removeInputPlatformStyling,
          height: '100%',
          ...this.theme.paddingLeft(this.componentOptions().paddingLeft),
          ...this.theme.color(this.componentOptions().textColor),
          // `typeFace` is the deprecated casing; themes that still set it win
          // only when the canonical key is absent.
          ...this.theme.typeface(
            this.componentOptions().typeface ?? this.componentOptions().typeFace
          ),
        },

        // Multi-line fields size themselves (rows/resize), not from the box.
        '& textarea': {
          height: 'auto',
          ...this.theme.paddingTop('xs'),
          ...this.theme.paddingBottom('xs'),
        },

        '&:has(input:disabled, select:disabled, textarea:disabled)': {
          ...this.theme.color(this.componentOptions().disabledTextColor),
          ...this.theme.backgroundColor(this.componentOptions().disabledColor),
        },

        '& input:disabled, select:disabled, textarea:disabled': {
          cursor: 'not-allowed !important',
        },

        '&:has(input:focus, select:focus, textarea:focus)': {
          outline: this.componentOptions().focusOutline,
          outlineOffset: this.componentOptions().focusOutlineOffset,
          // Optional focus chrome (border/ring/background). It yields to the
          // error state, so a flagged field stays visibly flagged while the
          // user is in it correcting the value.
          ...(this.error()
            ? {}
            : {
                ...this.theme.border(this.componentOptions().focusBorder),
                ...this.theme.boxShadow(this.componentOptions().focusShadow),
                ...this.theme.backgroundColor(this.componentOptions().focusColor),
              }),
        },
      },
    ])
  );
}
