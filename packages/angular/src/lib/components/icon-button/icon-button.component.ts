import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';

import { type IconName } from '../icon/icon.record';
import { RippleDirective } from '../../directives';
import { UniSymbolComponent } from '../symbol';
import { UniIconComponent } from '../icon';
import { ThemeService } from '../../theming/theme.service';
import { visuallyHidden } from '../../cdk';
import type { ColorKey, RadiiSize, Size, Variant } from '@uni-design-system/uni-core';

/**
 * What a variant means for an icon button, as theme data the component reads.
 * Mirrors `uni-button`'s: only the focus ring needs naming, because it is drawn
 * outside the element and so cannot take its colour from the fill.
 */
export interface UniIconButtonVariant {
  /** Keyboard-focus ring colour (WCAG 2.4.7). Falls back to `primary`. */
  focusColor?: ColorKey;
}

@Component({
  selector: 'button[uni-icon-button], button[icon-button]',
  imports: [UniSymbolComponent, UniIconComponent],
  template: `
    @if (loading()) {
      <uni-icon name="spinner" />
    } @else if (symbolName()) {
      <uni-symbol [name]="symbolName()!" [opticalSize]="opticalSize()" />
    } @else if (iconName()) {
      <uni-icon [name]="iconName()!" [size]="glyphSize()" />
    }
    <!-- Projected text is the button's accessible name (visually hidden) -->
    <span [class]="srOnlyClass"><ng-content /></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.disabled]': 'disable() || loading() || null',
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[attr.aria-label]': 'ariaLabel() || null',
    '[class]': 'className()',
  },
  hostDirectives: [{ directive: RippleDirective }],
})
export class UniIconButtonComponent {
  private theme = inject(ThemeService);
  config = this.theme.component<{ borderRadius?: RadiiSize }, UniIconButtonVariant>('iconButton');

  /**
   * Accessible name for the button. Alternative to projecting text content
   * (`<button icon-button>Close</button>`); one of the two is required for
   * an icon-only button to be announced correctly.
   */
  ariaLabel = input<string>();

  iconName = input<IconName>();
  symbolName = input<string>();
  variant = input<Variant>('ghost');
  size = input<Size>('lg');
  disable = input<boolean>();
  loading = input<boolean>();
  opticalSize = input(24);

  protected readonly srOnlyClass = css(visuallyHidden);

  /**
   * Sizes `iconName` from the size token's `fontSize`, the same value that sizes
   * a `symbolName` ligature — so the two paths render the same glyph size and
   * `symbolName` → `iconName` is a like-for-like swap. Without it a masked icon
   * fills the whole button box, since the base size tokens carry no padding.
   * Themes that do use padding (Carbon) set a matching `fontSize`, so they land
   * on the same glyph either way.
   */
  protected readonly glyphSize = computed(() => {
    // Size tokens are Emotion style objects, so `fontSize` is typed wider than
    // a CSS length; anything exotic falls back to filling the button as before.
    const fontSize = this.config().sizes?.[this.size()]?.fontSize;
    return typeof fontSize === 'number' || typeof fontSize === 'string' ? fontSize : undefined;
  });

  protected readonly className = computed(() => {
    const { sizes, variants } = this.config();
    const sizeConfig = sizes && sizes[this.size()];
    const colorConfig = variants && variants[this.variant()];

    return css([
      {
        position: 'relative',
        overflow: 'hidden',
        outline: 0,
        border: 0,
        cursor: 'pointer',
        transition: 'all 0.28s ease',
        // Token-driven radius (`max` = circle) with the legacy 999 fallback
        // for hand-authored themes that predate iconButton options.
        ...(this.theme.radius(this.config().options?.borderRadius) ?? { borderRadius: 999 }),
        // Block-level, but centring: the size tokens make the box bigger than
        // the glyph (an `sm` button is 22px around an 18px icon), so a plain
        // `display: block` parks the glyph in the top-left corner. Flex is
        // still block-level, so nothing about the button's own layout changes.
        // The accessible-name span is absolutely positioned and so stays out
        // of the flex flow.
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        '&:disabled': {
          cursor: 'not-allowed !important',
        },

        '& symbol': {
          fontSize: 'inherit',
          lineHeight: 'inherit',
        },
      },
      sizeConfig && {
        ...sizeConfig,
      },
      colorConfig && {
        ...colorConfig,
      },
      this.symbolName() &&
        !this.loading() && {
          padding: 0,
        },
      // The hover treatment is the theme's, declared per variant alongside the
      // colours it belongs with. It used to live here as a pair of branches on
      // `variant() === 'ghost'`, which was the last place a component decided a
      // variant's *appearance* from its *name*.
      //
      // That partition was binary, so under an open registry every intent a
      // consumer registered fell into the not-ghost half and got a raised
      // shadow whether or not it suited — a recessive intent included. And
      // because the branches were applied after the theme's own styles, no
      // theme could correct it: both themes in this repo declare a ghost hover
      // and had it silently overridden.
      !this.loading() && {
        '&:disabled': {
          ...this.config().variants?.disabled,
        },
      },

      // The keyboard-focus indicator (WCAG 2.4.7). The structural block above
      // clears the user-agent outline and, until now, put nothing back — so an
      // icon button had no focus indicator at all, in any variant. That is the
      // close affordance in every dialog and drawer header.
      //
      // Applied last on purpose: its *appearance* is the theme's, through
      // `focusColor` and the `focusRing` primitives `focusRingStyle` reads, but
      // whether an indicator exists is not a style choice a theme should be
      // able to switch off by accident.
      {
        '&:focus-visible': { ...this.theme.focusRingStyle(this.focusRingColor()) },
      },
    ]);
  });

  /**
   * The focus ring's colour, from the variant's theme entry — never from the
   * variant *name*, which is what left `uni-button`'s ring transparent on
   * `ghost` and absent on every unthemed intent. Falls back to the reserved
   * `primary` accent so a ring always renders.
   */
  private readonly focusRingColor = computed(() => {
    const colors = this.theme.colors();
    const token = this.config().variantOptions?.[this.variant()]?.focusColor;
    return (token && colors[token]) || colors['primary'];
  });
}
