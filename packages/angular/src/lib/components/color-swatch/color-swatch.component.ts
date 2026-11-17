import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import { css } from '@emotion/css';
import { nameHue, normalizeHex, type Size, type StyleExpression } from '@uni-design-system/uni-core';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniColorSwatchFace, UniColorSwatchOptions } from './color-swatch.model';

declare const ngDevMode: boolean | undefined;

/**
 * A color that is content rather than theme — a paint, a fabric, a brand
 * ink, a sampled pixel — shown as a bordered block with its name beside it.
 *
 * The one rule: **a color is never shown by color alone.** `chip` and `tile`
 * put the name in the DOM; `card` and `dot` cannot carry text, so they are
 * `role="img"` with the name as their accessible name — derived for `card`,
 * required of the consumer for `dot`.
 *
 * The block's fill is the given `hex` in every scheme and never a theme
 * token: the swatch is the user's content. What the theme owns is the
 * chrome — above all the border, which is what makes a near-white read as a
 * swatch on a light surface.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-color-swatch, ColorSwatch',
  providers: [{ provide: COMPONENT_NAME, useValue: 'colorSwatch' }],
  host: { '[class]': 'className()' },
  template: `
    @if (textless()) {
      <span
        role="img"
        [class]="blockClassName()"
        [style.background-color]="fill()"
        [attr.aria-label]="description()"
      ></span>
    } @else {
      <span aria-hidden="true" [class]="blockClassName()" [style.background-color]="fill()"></span>
      <span [class]="textClassName()">
        @if (hasValue()) {
          @if (name()) {
            <span data-part="name">{{ name() }}</span>
          }
          @if (detail()) {
            <span data-part="detail">{{ detail() }}</span>
          }
          @if (caption()) {
            <span data-part="caption">{{ caption() }}</span>
          }
        } @else {
          <span data-part="detail">{{ emptyLabel() }}</span>
        }
      </span>
    }
  `,
})
export class UniColorSwatchComponent extends BaseComponent<UniColorSwatchOptions> {
  /**
   * The color, in any spelling uni-core's `normalizeHex` reads (`#434C5A`,
   * `434c5a`, `rgb(67, 76, 90)`). Absent or unreadable renders the empty block.
   */
  hex = input<string | null>();

  /** What the color is called. */
  name = input<string>();

  /** Secondary text: after the name on `chip`, the line under it on `tile`. */
  detail = input<string>();

  /** A small third line — where the color came from, when it was matched. */
  caption = input<string>();

  /**
   * - `chip` — the block and one line of text, inline in a sentence or a row.
   * - `tile` — the block beside two lines: the name, then the detail.
   * - `card` — the block alone, filling its container edge to edge: the image
   *   area of a card, a gallery slide, a thumbnail. The host sizes the box and
   *   draws any caption; the swatch carries the words as its accessible name.
   * - `dot` — the block alone at `size`, round. Requires `ariaLabel`.
   */
  face = input<UniColorSwatchFace>('chip');

  /** The block's edge, from the theme's `colorSwatch.sizes` (base: 14 / 22 / 40 / 72px). */
  override size = input<Size>('md');

  /**
   * Accessible name for the text-less faces. Required for `dot`; on `card` it
   * replaces the derived "name, detail, hue".
   */
  ariaLabel = input<string>();

  /** Shown, and read, when no hex, name or detail is given. */
  emptyLabel = input('No color yet');

  constructor() {
    super();

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        if (this.face() === 'dot' && !this.ariaLabel()) {
          console.error(
            '[uni-color-swatch] face="dot" shows color alone and needs an `ariaLabel` — ' +
              'a color must never be the only thing that says what it is.'
          );
        }
      });
    }
  }

  protected readonly textless = computed(() => this.face() === 'card' || this.face() === 'dot');

  protected readonly fill = computed(() => normalizeHex(this.hex()));

  protected readonly hasValue = computed(
    () => !!(this.fill() || this.name()?.trim() || this.detail()?.trim())
  );

  /** "Hale Navy, HC-154 · Benjamin Moore, a dark slate blue" — for `role="img"`. */
  protected readonly description = computed(() => {
    const label = this.ariaLabel();
    if (label) return label;
    if (!this.hasValue()) return this.emptyLabel();
    return [this.name(), this.detail(), nameHue(this.fill())]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(', ');
  });

  /** The block's edge for the active `size`, read out of the theme as data. */
  private readonly edge = computed(() => {
    const size = (this.componentTheme().sizes?.[this.size()] as StyleExpression | undefined)
      ?.height;
    return typeof size === 'number' ? size : 22;
  });

  protected readonly className = computed(() => {
    const face = this.face();
    if (face === 'card') return css({ display: 'block', width: '100%', height: '100%' });
    return css({
      display: 'inline-flex',
      alignItems: 'center',
      ...this.theme.gap(this.componentOptions().gap),
      minWidth: 0,
      maxWidth: '100%',
      verticalAlign: 'middle',
    });
  });

  protected readonly blockClassName = computed(() => {
    const options = this.componentOptions();
    const face = this.face();
    const edge = this.edge();
    const empty = this.theme.colorPalette()[options.emptyColor ?? 'surface'];
    return css([
      {
        ...this.theme.border(options.border),
        ...this.theme.radius(options.borderRadius),
        boxSizing: 'border-box',
        flex: 'none',
        display: 'block',
        width: edge,
        height: edge,
        // The block is the content: it prints as it shows.
        printColorAdjust: 'exact',
        // No hex: the surface with one hairline diagonal — never a
        // placeholder hue, which would be a color nobody chose. An inline
        // background-color (a real hex) paints over the fill; the diagonal is
        // switched off for it below.
        backgroundColor: empty,
        '&:not([style*="background-color"])': {
          backgroundImage: `linear-gradient(to top right,
            transparent calc(50% - 0.5px),
            color-mix(in srgb, currentColor 30%, transparent) calc(50% - 0.5px),
            color-mix(in srgb, currentColor 30%, transparent) calc(50% + 0.5px),
            transparent calc(50% + 0.5px))`,
        },
      },
      face === 'dot' && { borderRadius: '50%' },
      // The image area of a card: flat, edge to edge, the host's box.
      face === 'card' && { width: '100%', height: '100%', borderRadius: 0 },
    ]);
  });

  protected readonly textClassName = computed(() => {
    const options = this.componentOptions();
    const tile = this.face() === 'tile';
    return css({
      minWidth: 0,
      ...(tile
        ? { display: 'flex', flexDirection: 'column' }
        : { display: 'inline', '& > [data-part] + [data-part]::before': { content: '" · "' } }),
      '& > [data-part="name"]': { ...this.theme.typeface(options.nameTypeface) },
      '& > [data-part="detail"]': {
        ...this.theme.typeface(options.detailTypeface),
        ...this.theme.color(options.detailColor),
      },
      '& > [data-part="caption"]': {
        ...this.theme.typeface(options.captionTypeface),
        ...this.theme.color(options.detailColor),
      },
    });
  });
}
