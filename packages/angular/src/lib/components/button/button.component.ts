import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from '@emotion/css';

import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniButtonOptions, UniButtonVariant } from './button.model';
import { UniIconComponent } from '../icon';
import { UniBoxDirective } from '../layout';
import { UniSymbolComponent } from '../symbol';
import { RippleDirective } from '../../directives/ripple';

@Component({
  selector: 'button[uni-text-button], button[text-button]',
  template: `@if (loading()) {
      <div box-layout [class]="spinnerBox"><uni-icon name="spinner" /></div>
    }
    @if (symbolLeft()) {
      <uni-symbol [name]="symbolLeft()!" class="symbolLeft" />
    }
    <span><ng-content></ng-content></span>
    @if (symbolRight()) {
      <uni-symbol [name]="symbolRight()!" class="symbolRight" />
    } `,
  providers: [{ provide: COMPONENT_NAME, useValue: 'button' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RippleDirective, // Keep this import
    UniIconComponent,
    UniBoxDirective,
    UniSymbolComponent,
  ],
  host: {
    '[attr.disabled]': 'disable() || loading() || null',
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[class]': 'className()',
  },
  hostDirectives: [{ directive: RippleDirective }],
})
export class UniButtonComponent extends BaseComponent<UniButtonOptions, UniButtonVariant> {
  readonly disable = input<boolean | undefined>(false);
  readonly loading = input<boolean | undefined>(false);
  readonly fullWidth = input<boolean>(false);

  readonly symbolLeft = input<string>();
  readonly symbolRight = input<string>();

  spinnerBox = css({
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '100%',
    paddingTop: '6%',
    paddingBottom: '6%',
  });

  protected readonly className = computed(() =>
    css([
      // Token-driven radius + typeface from component options. Applied before
      // `style()` so theme `sizes`/`fixed` (per-size fontSize, or hand-set
      // radii/families in older themes) keep winning.
      this.theme.radius(this.componentOptions().borderRadius),
      { ...this.theme.typeface(this.componentOptions().typeface) },

      // Presentational defaults, deliberately *before* `style()` so the theme
      // outranks them. They used to sit after it, which made them unthemeable:
      // a variant could not give a button a border without `!important`, and
      // the shorthand then forced `!important` onto every state that adjusted
      // it. The base theme was caught by this too — its `secondary` variant is
      // commented "Hollow" and declares `1px solid`, which this block erased.
      {
        overflow: 'hidden',
        outline: 0,
        border: 0,
        cursor: 'pointer',
        transition: 'all 0.28s ease',
      },

      this.style() && {
        ...this.style(),
      },

      // Structure the component genuinely owns: `position` anchors the ripple,
      // and the rest is its internal slot layout.
      {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',

        '&:disabled': {
          cursor: 'not-allowed !important',
        },
        '& .symbolLeft': {
          marginLeft: -6,
          marginRight: 4,
          fontSize: this.symbolSize(),
        },
        '& span': {
          alignContent: 'center',
          flexGrow: 1,
          whiteSpace: 'nowrap',
        },
        '& .symbolRight': {
          marginRight: -6,
          marginLeft: 4,
          fontSize: this.symbolSize(),
        },
      },
      // Hover/pressed styling lives in the theme's button variants (solid vs.
      // hollow, per-variant states). The keyboard-focus indicator (WCAG 2.4.7)
      // stays component-owned, but its *colour* is the theme's — see
      // `focusRingColor`. Routed through the shared `focusRingStyle` so a theme
      // defining `focusRing` border/shadow primitives restyles it here too,
      // exactly as it already does for checkbox, radio and toggle.
      {
        '&:focus-visible': { ...this.theme.focusRingStyle(this.focusRingColor()) },
      },
      this.fullWidth() && {
        width: '100%',
      },
      !this.loading() && {
        '&:disabled': {
          ...this.componentTheme().variants?.disabled,
        },
      },
      this.loading() && {
        '&:disabled symbol': {
          opacity: 0,
        },
        '&:disabled span': {
          opacity: 0,
        },
      },
    ])
  );

  /**
   * The focus ring's colour, from the variant's theme entry.
   *
   * This used to be `colors[variant()]` — the variant *name* resolved as a
   * colour token. That held together only while every variant happened to also
   * be a colour, and it failed silently in both directions: `ghost` resolves to
   * `transparent`, and `light`/`onLight`/`dark`/`onDark` (and any name a
   * consumer registers) resolve to nothing, emitting `2px solid undefined`
   * which the parser drops. `outline-offset` survived either way, so the
   * element still shifted on focus and the missing ring went unnoticed.
   *
   * Falls back to the reserved `primary` accent rather than to `currentColor`:
   * the ring is drawn outside the element, so on a filled button
   * `currentColor` is the label colour and would sit near-invisibly against
   * the page rather than the button.
   */
  private readonly focusRingColor = computed(() => {
    const colors = this.theme.colors();
    const token = this.variantRoles()?.focusColor;
    return (token && colors[token]) || colors['primary'];
  });

  symbolSize = computed(() => {
    const fontSize = parseFloat(String(this.style()['fontSize'] ?? ''));
    // Fall back to the default icon size when the theme defines no fontSize
    return (Number.isNaN(fontSize) ? 16 : fontSize) + 4;
  });
}
