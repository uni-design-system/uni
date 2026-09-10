import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { css } from '@emotion/css';
import type { IconName, Size, TagTone } from '@uni-design-system/uni-core';

import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniIconComponent } from '../icon';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniSymbolComponent } from '../symbol';
import type { UniTagOptions, UniTagValue } from './tag.model';

/** The first length in a `padding` shorthand's inline position, as a number. */
const inlinePaddingOf = (style: Record<string, unknown>): number => {
  const explicit = Number.parseFloat(String(style['paddingInline'] ?? ''));
  if (Number.isFinite(explicit)) return explicit;

  // A consumer theme may still state the shorthand. `0 10px` and `0 10px 0 8px`
  // both put the inline value second; a single value applies to every side.
  const parts = String(style['padding'] ?? '').trim().split(/\s+/);
  const shorthand = Number.parseFloat(parts[1] ?? parts[0] ?? '');
  return Number.isFinite(shorthand) ? shorthand : 10;
};

/**
 * Compact chip for categories, states, filters and tokens.
 *
 * Two orthogonal style axes: `variant` picks the colour role and `tone` picks
 * the archetype (soft / solid / outline). Both live in the theme's `tag` entry,
 * so a theme restyles every chip in the app without touching markup. Two state
 * classes ride alongside the tone class for the same reason: `tag-selected` and
 * `tag-interactive` let the theme paint selection and hover beside the colours
 * they belong to, instead of an app swapping `tone` by hand on every chip.
 *
 * Structurally a chip is **body + trailing action as siblings**, never nested
 * buttons: an interactive chip whose body is a `<button>` cannot contain the
 * remove `<button>` (invalid HTML, and the inner control becomes unreachable
 * for keyboard users). Both stay independently operable.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-tag',
  imports: [NgTemplateOutlet, UniIconComponent, UniIconButtonComponent, UniSymbolComponent],
  templateUrl: './tag.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'tag' }],
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-invalid]': "invalid() ? 'true' : null",
  },
})
export class UniTagComponent<T extends UniTagValue = UniTagValue> extends BaseComponent<UniTagOptions> {
  // Presentation. `variant` comes from BaseComponent; chips default to `md`
  // rather than the library-wide `lg`, since they sit inside dense content.
  override size = input<Size>('md');
  tone = input<TagTone>('soft');
  label = input<string>();
  value = input<T>();
  /** Truncation budget, e.g. `'14ch'`. A number is treated as px. */
  maxWidth = input<string | number>();

  // Lead convenience inputs. Anything richer goes in the `[tag-lead]` slot.
  avatarSrc = input<string>();
  /** Initials fallback when `avatarSrc` is absent or fails to load. */
  avatarName = input<string>();
  /** Theme icon primitive — the preferred glyph path. */
  iconName = input<IconName>();
  /** Material Symbols ligature, for glyphs the theme's icon set doesn't carry. */
  symbolName = input<string>();
  /** Status dot in the current colour. */
  dot = input<boolean>(false);

  // Behaviour
  removable = input(false);
  interactive = input(false);
  /**
   * Toggle state. Left undefined the chip carries no `aria-pressed` at all —
   * an interactive chip is not always a toggle (inside a tag input it is
   * focusable so it can be removed), and announcing "not pressed" on a
   * recipient chip is worse than announcing nothing.
   */
  selected = input<boolean | undefined>(undefined);
  invalid = input(false);
  disabled = input(false);
  /** Accessible-name override for the remove button. */
  removeLabel = input<string>();
  /**
   * Tab position of the chip's controls. A composite that owns its own
   * roving focus — `uni-tag-input` or `uni-tag-group`, where the whole
   * thing is one tab stop — passes `-1` so Tab does not walk through every
   * chip to reach the next control.
   */
  controlTabIndex = input<number>(0);

  removed = output<T | undefined>();
  activated = output<T | undefined>();

  /** A disabled chip wears the theme's `disabled` role, whatever its variant. */
  protected readonly resolvedVariant = computed(() =>
    this.disabled() ? ('disabled' as const) : this.variant()
  );

  protected readonly themeStyle = computed(() =>
    this.theme.componentStyle('tag', this.resolvedVariant(), this.size())()
  );

  protected readonly height = computed(() => {
    const height = Number(this.themeStyle()['height'] ?? 24);
    return Number.isFinite(height) ? height : 24;
  });

  /** Lead elements derive from the chip height, so no second size token. */
  protected readonly leadSize = computed(() => Math.max(this.height() - 6, 0));

  /** Remove glyph, proportional to the chip rather than to the icon-button. */
  protected readonly removeGlyphSize = computed(() =>
    Math.max(Math.round(this.leadSize() * 0.8), 10)
  );

  protected readonly initials = computed(() =>
    (this.avatarName() ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  );

  /** Glyph the theme shows in the lead slot for a selected chip, if any. */
  protected readonly selectedIcon = computed(() => this.componentOptions().selectedIcon);

  /**
   * The chip is a toggle: `selected` was bound, so the chip is one of a set the
   * user switches on and off — the same tri-state that gates `aria-pressed`.
   */
  protected readonly isToggle = computed(() => this.selected() !== undefined);

  /** A lead element the chip renders itself, rather than the projected slot. */
  protected readonly hasOwnLead = computed(
    () =>
      !!this.avatarSrc() ||
      !!this.initials() ||
      !!this.iconName() ||
      !!this.symbolName() ||
      this.dot()
  );

  /**
   * A toggle chip with nothing else in the lead holds the check's place while
   * unselected. Without it the chip grows by a glyph the moment it is picked
   * and the whole row reflows — and a row that jumps under the pointer is worse
   * than one with a little space in front of each label.
   */
  protected readonly reservesSlot = computed(
    () => this.isToggle() && !!this.selectedIcon() && !this.hasOwnLead()
  );

  /** Whether the chip paints a lead box at all, so the start end tucks. */
  protected readonly showsLead = computed(() => this.hasOwnLead() || this.reservesSlot());

  /** Status dots are their own size — a lead box would dwarf one. */
  protected readonly dotSize = computed(() => Math.max(Math.round(this.leadSize() / 3), 6));

  /** Width the lead actually occupies, which a dot changes. */
  private readonly leadWidth = computed(() =>
    this.dot() && !this.selected() ? this.dotSize() : this.leadSize()
  );

  /**
   * Whether the ends are round enough to tuck anything into.
   *
   * The theme's documented `borderRadius: 'xs'` switch to rectangular labels
   * leaves no curve to flow into, and a glyph jammed against a corner is worse
   * than one sitting in a gutter.
   */
  private readonly tucks = computed(() => {
    const token = this.componentOptions().borderRadius;
    const radius = Number.parseFloat(String(token ? (this.theme.radii()[token] ?? '') : ''));
    // `max` is `999px`; what a pill actually curves by is half its height.
    const cap = Math.min(Number.isFinite(radius) ? radius : 0, this.height() / 2);
    return cap >= this.leadSize() / 2;
  });

  /**
   * How far an element of `size` sits from its end of the chip.
   *
   * `auto` centres it in the cap: an element `size` tall has `(height - size)/2`
   * of chip above and below it, so the same inset horizontally makes it
   * concentric with the curve. A lead box lands 3px in — flowing into the round
   * end rather than beginning where the radius ends — while a 6px status dot
   * keeps its distance, because a dot pushed that far in reads as a smudge on
   * the edge.
   */
  private inset(size: number): number {
    const configured = this.componentOptions().endInset ?? 'auto';
    if (typeof configured === 'number') return configured;
    return this.tucks() ? (this.height() - size) / 2 : inlinePaddingOf(this.themeStyle());
  }

  /** The themed `gap` as a number, for the padding arithmetic. */
  private readonly gapSize = computed(() => {
    const gap = this.componentOptions().gap;
    if (!gap || gap === 'none') return 0;
    const value = Number.parseFloat(String(this.theme.getSpacing(gap) ?? ''));
    return Number.isFinite(value) ? value : 0;
  });

  /**
   * Inline padding: the ends tuck, and a lead is balanced against.
   *
   * A lead pushes the label off centre, so the far side grows to match it —
   * each end asks for the room it needs (its own inset, plus whatever it holds,
   * plus the gap) and the wider ask wins for both. The tuck costs less than the
   * old gutter did, so that balance is largely paid for rather than added.
   *
   * The remove control is not balanced against on its own. It reads as an
   * affordance rather than as content, so a chip with nothing but a remove
   * button keeps the size token's gutter at the start and simply tucks the
   * glyph into the trailing curve — padding the other side to match would leave
   * a plain label sitting behind a stretch of empty chip.
   */
  protected readonly padding = computed(() => {
    const gap = this.gapSize();
    const basePad = inlinePaddingOf(this.themeStyle());
    const trailRun = this.removable() ? this.leadSize() + gap : 0;
    const trailPad = this.removable() ? this.inset(this.leadSize()) : basePad;

    if (!this.showsLead()) return { start: basePad, end: trailPad };

    const leadRun = this.leadWidth() + gap;
    const block = Math.max(this.inset(this.leadWidth()) + leadRun, trailPad + trailRun);

    return { start: block - leadRun, end: block - trailRun };
  });

  protected readonly hostClass = computed(() => {
    const options = this.componentOptions();
    const motion = this.theme.motion(options.motion ?? 'control');
    const timing = `${motion.duration}ms ${motion.easing}`;
    const lead = this.showsLead();
    const trail = this.removable();
    const pad = this.padding();
    const states = [
      `tone-${this.tone()}`,
      this.interactive() ? 'tag-interactive' : '',
      this.selected() ? 'tag-selected' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `${css([
      {
        // Scoped, never `all`: `all` would animate the reserved slot, the
        // padding balance and — inside a justified group — the chip's width.
        // `border-color` earns its place because the outline tone changes only
        // the edge, which used to snap while the fill faded; `filter` carries
        // the theme's hover and selected washes.
        transition:
          `background-color ${timing}, color ${timing},` +
          ` border-color ${timing}, filter ${timing}`,
      },
      this.theme.radius(options.borderRadius),
      { ...this.theme.typeface(options.typeface) },
      // Theme `fixed` + variant (incl. its nested `&.tone-*`, `&.tag-selected`
      // and hover rules) + size.
      { ...this.themeStyle() },
      { ...this.theme.gap(options.gap) },
      {
        boxSizing: 'border-box',
        maxWidth: this.maxWidth(),
        // Longhands, stated after the size token's `paddingInline`, so they
        // win. Left alone when the chip is a plain label: there is nothing to
        // balance, and the size token's own gutter is the right answer.
        ...((lead || trail) && {
          paddingInlineStart: pad.start,
          paddingInlineEnd: pad.end,
        }),
        // The projected `[tag-lead]` slot is an attribute, not a queryable
        // child, so the only way to balance for it is to ask the DOM — at a
        // lead box's width, since its content could be anything.
        ...(!lead && {
          '&:has([tag-lead])': {
            paddingInlineStart: this.inset(this.leadSize()),
            paddingInlineEnd: trail
              ? this.inset(this.leadSize())
              : this.inset(this.leadSize()) + this.leadSize() + this.gapSize(),
          },
        }),
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
          fontSize: this.removeGlyphSize(),
          // uni-icon writes width/height as *inline* styles, sized from the
          // icon-button's own `sm` size token (18px — wider than an `sm` chip).
          // Only !important can reach past an inline style to keep the glyph
          // proportional to the chip.
          '& uni-icon': {
            width: `${this.removeGlyphSize()}px !important`,
            height: `${this.removeGlyphSize()}px !important`,
          },
        },
      },
      this.invalid() && {
        // Colour alone cannot carry "this entry is malformed" (WCAG 1.4.1).
        textDecoration: 'underline dashed',
        textUnderlineOffset: 3,
      },
      this.disabled() && { pointerEvents: 'none' },
    ])} ${states}`;
  });

  /**
   * Truncating label. It grows, so a chip stretched to fill a justified row
   * puts the slack around its text instead of behind it — the tucked ends stay
   * where they are and the label stays centred. `title` exposes the full text
   * when a budget is set.
   */
  protected readonly labelClass = css({
    flex: '1 1 auto',
    minWidth: 0,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  });

  protected readonly bodyClass = computed(() =>
    css([
      {
        display: 'inline-flex',
        alignItems: 'center',
        flex: '1 1 auto',
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

  /** The held-open check slot: the lead's footprint and nothing in it. */
  protected readonly slotClass = computed(() =>
    css({ flex: 'none', width: this.leadSize(), height: this.leadSize() })
  );

  protected readonly dotClass = computed(() =>
    css({
      flex: 'none',
      width: this.dotSize(),
      height: this.dotSize(),
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
