import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { css } from '@emotion/css';
import type { Size, TagTone } from '@uni-design-system/uni-core';

import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniSymbolComponent } from '../symbol';
import type { UniTagOptions, UniTagValue } from './tag.model';

/**
 * Compact chip for categories, states, filters and tokens.
 *
 * Two orthogonal style axes: `variant` picks the colour role and `tone` picks
 * the archetype (soft / solid / outline). Both live in the theme's `tag` entry,
 * so a theme restyles every chip in the app without touching markup.
 *
 * Structurally a chip is **body + trailing action as siblings**, never nested
 * buttons: an interactive chip whose body is a `<button>` cannot contain the
 * remove `<button>` (invalid HTML, and the inner control becomes unreachable
 * for keyboard users). Both stay independently operable.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-tag',
  imports: [NgTemplateOutlet, UniIconButtonComponent, UniSymbolComponent],
  templateUrl: './tag.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'tag' }],
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-invalid]': "invalid() ? 'true' : null",
  },
})
export class UniTagComponent extends BaseComponent<UniTagOptions> {
  // Presentation. `variant` comes from BaseComponent; chips default to `md`
  // rather than the library-wide `lg`, since they sit inside dense content.
  override size = input<Size>('md');
  tone = input<TagTone>('soft');
  label = input<string>();
  value = input<string | number>();
  /** Truncation budget, e.g. `'14ch'`. A number is treated as px. */
  maxWidth = input<string | number>();

  // Lead convenience inputs. Anything richer goes in the `[tag-lead]` slot.
  avatarSrc = input<string>();
  /** Initials fallback when `avatarSrc` is absent or fails to load. */
  avatarName = input<string>();
  symbolName = input<string>();
  /** Status dot in the current colour. */
  dot = input<boolean>(false);

  // Behaviour
  removable = input(false);
  interactive = input(false);
  selected = input(false);
  invalid = input(false);
  disabled = input(false);
  /** Accessible-name override for the remove button. */
  removeLabel = input<string>();

  removed = output<UniTagValue>();
  activated = output<UniTagValue>();

  /** A disabled chip wears the theme's `disabled` role, whatever its variant. */
  protected readonly resolvedVariant = computed(() =>
    this.disabled() ? ('disabled' as const) : this.variant()
  );

  protected readonly themeStyle = computed(() =>
    this.theme.componentStyle('tag', this.resolvedVariant(), this.size())()
  );

  /** Lead elements derive from the chip height, so no second size token. */
  protected readonly leadSize = computed(() => {
    const height = Number(this.themeStyle()['height'] ?? 24);
    return Number.isFinite(height) ? Math.max(height - 6, 0) : 18;
  });

  protected readonly initials = computed(() =>
    (this.avatarName() ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  );

  protected readonly hostClass = computed(() => {
    const options = this.componentOptions();

    return `${css([
      this.theme.radius(options.borderRadius),
      { ...this.theme.typeface(options.typeface) },
      // Theme `fixed` + variant (incl. its nested `&.tone-*` rules) + size.
      { ...this.themeStyle() },
      { ...this.theme.gap(options.gap) },
      {
        boxSizing: 'border-box',
        maxWidth: this.maxWidth(),
        // The chip is not a widget; only its sub-controls take focus.
        '& > button': this.theme.focusRing(),
        // The remove control is the trailing counterpart of the lead, so it
        // sizes from the chip too. Left at the icon-button's own `sm` size it
        // is 22px inside a 24px chip — and taller than an `sm` chip entirely.
        '& > button[uni-icon-button]': {
          flex: 'none',
          width: this.leadSize(),
          minWidth: this.leadSize(),
          height: this.leadSize(),
          minHeight: this.leadSize(),
          padding: 0,
          fontSize: Math.max(Math.round(this.leadSize() * 0.8), 10),
        },
      },
      this.invalid() && {
        // Colour alone cannot carry "this entry is malformed" (WCAG 1.4.1).
        textDecoration: 'underline dashed',
        textUnderlineOffset: 3,
      },
      this.disabled() && { pointerEvents: 'none' },
    ])} tone-${this.tone()}`;
  });

  /** Truncating label; `title` exposes the full text when a budget is set. */
  protected readonly labelClass = css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  });

  protected readonly bodyClass = computed(() =>
    css([
      {
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: 0,
        // The body inherits the chip's own colours in every case.
        font: 'inherit',
        color: 'inherit',
        background: 'none',
        border: 0,
        padding: 0,
        ...this.theme.gap(this.componentOptions().gap),
      },
      this.interactive() && { cursor: 'pointer' },
    ])
  );

  protected readonly leadClass = computed(() =>
    css({
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      width: this.leadSize(),
      height: this.leadSize(),
      borderRadius: '50%',
      fontSize: Math.max(Math.round(this.leadSize() * 0.5), 8),
      // Initials sit on a wash of the current ink so they read on any tone.
      backgroundColor: this.avatarSrc() ? undefined : 'rgba(0, 0, 0, 0.12)',
      '& img': { width: '100%', height: '100%', objectFit: 'cover' },
    })
  );

  protected readonly dotClass = computed(() =>
    css({
      flex: 'none',
      width: Math.max(Math.round(this.leadSize() / 3), 6),
      height: Math.max(Math.round(this.leadSize() / 3), 6),
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    })
  );

  protected remove(): void {
    if (this.disabled()) return;
    this.removed.emit(this.value());
  }

  protected activate(): void {
    if (this.disabled()) return;
    this.activated.emit(this.value());
  }
}
