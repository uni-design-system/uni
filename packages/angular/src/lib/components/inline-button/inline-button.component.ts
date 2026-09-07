import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { css } from '@emotion/css';
import type { ColorKey } from '@uni-design-system/uni-core';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniIconComponent } from '../icon';
import type { IconName } from '../icon/icon.record';
import { UniSymbolComponent } from '../symbol';
import type { UniInlineButtonOptions } from './inline-button.model';

/**
 * A tri-state boolean attribute: absent stays `undefined` so the theme's
 * default still decides, while a bare `underline` (which the DOM hands over as
 * the empty string) reads as true rather than as false.
 */
const optionalBooleanAttribute = (value: unknown): boolean | undefined =>
  value === undefined || value === null ? undefined : booleanAttribute(value);

/**
 * A button that lives inside a sentence.
 *
 * Every other button in the library owns a box. Even `ghost` is a flex box
 * with a hit area, horizontal padding and a type scale of its own, so dropping
 * one into a sentence takes it out of the run of text entirely. This one
 * inherits that type — family, size, weight, line height and colour — and adds
 * no padding, so a paragraph reads as one continuous run with an action in the
 * middle of it.
 *
 * It is always a real `<button>`: it can *look* like a link (`underline`,
 * `link`) without claiming to be navigation, so Enter and Space activate it
 * and assistive tech announces a button rather than an unfollowable link.
 *
 * A glyph may sit alongside the label without disturbing that: it is sized in
 * `em`, so it scales with the type it lands in rather than pinning a px size
 * into someone else's paragraph.
 *
 * One limit comes from the element itself. Browsers blockify a `<button>` to
 * `inline-block` whatever `display` it asks for, so the control is an atomic
 * inline box: its own label wraps inside it, but the run cannot split across a
 * line break the way the words around it do. `display: contents` would buy
 * that at the cost of the button being focusable at all, which is not a trade
 * worth making — keep labels to a few words, which is what an inline action
 * wants anyway.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'button[uni-inline-button], button[inline-button]',
  imports: [NgTemplateOutlet, UniIconComponent, UniSymbolComponent],
  providers: [{ provide: COMPONENT_NAME, useValue: 'inlineButton' }],
  template: `
    @if (glyphAtStart()) {
      <ng-container [ngTemplateOutlet]="glyph" />
    }<span [class]="labelClass()"><ng-content /></span>@if (!glyphAtStart()) {
      <ng-container [ngTemplateOutlet]="glyph" />
    }

    <ng-template #glyph>
      @if (iconName()) {
        <uni-icon [name]="iconName()!" [size]="glyphSize()" [class]="glyphClass()" />
      } @else if (symbolName()) {
        <uni-symbol [name]="symbolName()!" [class]="glyphClass()" />
      }
    </ng-template>
  `,
  host: {
    type: 'button',
    '[class]': 'className()',
    '[attr.disabled]': 'disable() || null',
  },
})
export class UniInlineButtonComponent extends BaseComponent<UniInlineButtonOptions> {
  /** Theme icon token rendered beside the label. Prefer this over `symbolName`. */
  readonly iconName = input<IconName>();

  /** Material Symbols ligature, for glyphs the theme's icon set doesn't carry. */
  readonly symbolName = input<string>();

  /** Which side of the label the glyph sits on. */
  readonly iconPosition = input<'start' | 'end'>('start');

  /** Underline the label, overriding the theme's default. */
  readonly underline = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /** Paint the label with the theme's link colour instead of inheriting the ink. */
  readonly link = input(false, { transform: booleanAttribute });

  readonly disable = input(false, { transform: booleanAttribute });

  protected readonly glyphAtStart = computed(() => this.iconPosition() === 'start');

  /**
   * `1em` rather than a px size: the control inherits the surrounding type, so
   * the glyph has to scale with it or it will look wrong in every context but
   * the one it was measured in.
   */
  protected readonly glyphSize = computed(() => '1em');

  private readonly showUnderline = computed(
    () => this.underline() ?? this.componentOptions().underline ?? false
  );

  protected readonly className = computed(() => {
    const options = this.componentOptions();
    const linkInk = this.link()
      ? this.theme.color((options.linkColor ?? 'primary') as ColorKey)
      : undefined;

    return css({
      // Coerced to `inline-block` by the engine, and declared anyway: a reset
      // that makes buttons `display: block` would otherwise put this one on a
      // line of its own.
      display: 'inline',
      font: 'inherit',
      // `font` is a shorthand and already carries line-height.
      letterSpacing: 'inherit',
      color: 'inherit',
      textAlign: 'inherit',
      background: 'none',
      border: 0,
      padding: 0,
      margin: 0,
      cursor: 'pointer',
      // Only the underline is ours to draw; the label keeps the text's own.
      textDecoration: 'none',
      ...linkInk,

      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.5,
      },

      '&:focus-visible': { ...this.theme.focusRingStyle(options.focusColor) },
    });
  });

  protected readonly labelClass = computed(() => {
    const options = this.componentOptions();
    const underlineStyle = {
      textDecorationLine: 'underline',
      textUnderlineOffset: options.underlineOffset ?? '0.15em',
    };

    return css({
      ...(this.showUnderline() ? underlineStyle : { textDecorationLine: 'none' }),
      ...((options.underlineOnHover ?? true) ? { '&:hover': underlineStyle } : {}),
    });
  });

  protected readonly glyphClass = computed(() => {
    const gap = this.theme.getSpacing(this.componentOptions().gap ?? 'xxs');
    return css({
      // Doubled, because both glyph components already style their own host at
      // this specificity: `uni-icon` declares `:host { display: block }`, which
      // put the glyph on its own line under the sentence, and `uni-symbol`
      // pins a 24px font size, which ignored the type it landed in.
      '&&': {
        // `inline-block` keeps the glyph on the text baseline; the nudge stops
        // a square icon from sitting visually low against lowercase letters.
        display: 'inline-block',
        verticalAlign: '-0.125em',
        // The em is the whole point: the glyph scales with the run of text,
        // from caption to headline, without a size at the call site. It sizes
        // `uni-symbol` directly and `uni-icon` through its `1em` size input.
        fontSize: '1em',
        lineHeight: 1,
        flex: 'none',
        ...(this.glyphAtStart() ? { marginRight: gap } : { marginLeft: gap }),
      },
    });
  });
}
