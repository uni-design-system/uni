import { Directive, computed, ElementRef, inject, input } from '@angular/core';
import { css } from '@emotion/css';

import type {
  ColorKey,
  OptionalDisplay,
  OptionalTextAlign,
  Typeface,
} from '@uni-design-system/uni-core';
import { ThemeService } from '../../theming';

/**
 * Typeface defaults by host element, so semantic HTML and the type scale
 * reinforce each other: `<h1 uni-text>` is already headline-large.
 */
const TagTypefaces: Record<string, Typeface> = {
  h1: 'headline-large',
  h2: 'headline-medium',
  h3: 'headline-small',
  h4: 'title-large',
  h5: 'title-medium',
  h6: 'title-small',
  p: 'body-1-long',
  small: 'caption',
  figcaption: 'caption',
  blockquote: 'quote',
  label: 'label',
};

/**
 * The typography primitive, applied as an attribute to any element so
 * semantics stay yours. The attribute value is the typeface:
 * `<h1 uni-text="display-small">`, `<span uni-text="caption">`, dynamic via
 * `[uni-text]="role()"`. With no value, the typeface is inferred from the
 * host element (h1 → headline-large, p → body-1-long, …), falling back to
 * `title-small`; the `typeface` input remains as an explicit override.
 *
 * It is a directive, so it stacks with anything else on the element — a layout
 * attribute (`<div stack-layout uni-text="title-small">`) or a component's own
 * host — rather than colliding with it.
 */
@Directive({
  selector: '[uni-text]',
  host: { '[class]': 'className()' },
})
export class UniTextDirective {
  theme = inject(ThemeService);
  private readonly tag = (inject(ElementRef).nativeElement as HTMLElement).tagName.toLowerCase();

  /** Typeface via the selector attribute: `uni-text="headline-large"`. */
  readonly uniText = input<Typeface | ''>('', { alias: 'uni-text' });
  /** Explicit typeface; the attribute value wins when both are set. */
  typeface = input<Typeface | undefined>(undefined);
  /** The ink, mapping straight to the CSS `color` property. */
  color = input<ColorKey>();
  display = input<OptionalDisplay>();
  align = input<OptionalTextAlign>();
  nowrap = input<boolean>();
  maxWidth = input<number>();
  ellipsis = input<boolean>(false);

  protected readonly resolvedTypeface = computed<Typeface>(
    () => this.uniText() || this.typeface() || TagTypefaces[this.tag] || 'title-small'
  );

  protected readonly className = computed(() => {
    return css([
      {
        ...this.theme.typeface(this.resolvedTypeface()),
        display: this.display(),
      },
      // An explicit ink color is emitted at doubled specificity so it beats the
      // paired on-color that a container directive on the same element
      // contributes (`containerColor` sets a background *and* its on-color).
      // Both are class rules, so without this the cascade would be settled by
      // Emotion's insertion order — text won on `row-layout` and silently lost
      // on `scroll-area`. With no explicit color, nothing is emitted here and
      // the container's on-color correctly shows through.
      this.color() && { '&&': { ...this.theme.color(this.color()) } },
      this.align() && {
        textAlign: this.align(),
      },
      this.nowrap() && {
        whiteSpace: 'nowrap',
      },
      this.maxWidth() && {
        maxWidth: this.maxWidth(),
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'inline-block',
      },
      this.ellipsis() && {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0,
      },
    ]);
  });
}
