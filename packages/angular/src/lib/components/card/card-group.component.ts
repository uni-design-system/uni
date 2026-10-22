import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { NullableSize } from '@uni-design-system/uni-core';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import {
  UNI_CARD_GROUP,
  type UniCardGroupOptions,
  type UniCardGroupPanel,
  type UniCardOption,
} from './card.model';

/**
 * Pick-one group of cards: a grid of `uni-card`s with radio semantics.
 *
 * The cards are projected, not rendered: a card's content is the point of a
 * card, and a group that rendered its own would need a slot for every line.
 * Each projected `uni-card` with a `value` registers as an option; the group
 * owns which one is selected and which one holds the tab stop, and the card
 * draws both.
 *
 * Keyboard model is the APG radio group: one tab stop for the group, the
 * arrow keys move focus *and* select (wrapping at the ends), Home and End go
 * to the first and last enabled card, Space or Enter selects the focused one.
 *
 * `FormValueControl<T | null>`, so `[formField]` binds it like every other
 * control; `touched` is set when focus leaves the group.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-card-group',
  imports: [],
  template: `<ng-content />`,
  providers: [
    { provide: COMPONENT_NAME, useValue: 'cardGroup' },
    { provide: UNI_CARD_GROUP, useExisting: forwardRef(() => UniCardGroupComponent) },
  ],
  host: {
    role: 'radiogroup',
    '[class]': 'hostClass()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledBy() ?? null',
    '[attr.aria-required]': 'required() ? true : null',
    '[attr.aria-invalid]': 'showError() ? true : null',
    '[attr.aria-describedby]': 'ariaDescribedBy() || null',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class UniCardGroupComponent<T = unknown>
  extends BaseComponent<UniCardGroupOptions>
  implements FormValueControl<T | null>, UniCardGroupPanel<T>
{
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  readonly value = model<T | null>(null);
  readonly disabled = input(false);
  readonly touched = model(false);
  /** Angular 22 marks the bound field touched through this output. */
  readonly touch = output<void>();
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  // --- Configuration -------------------------------------------------------
  /** Accessible name of the group, e.g. "Kind of work". */
  readonly ariaLabel = input<string>();
  /** Id of the element naming the group, when a visible heading does. */
  readonly ariaLabelledBy = input<string>();
  /** `grid-template-columns`, overriding the theme option per instance. */
  readonly templateColumns = input<string>();
  /** Space between cards, overriding the theme option per instance. */
  readonly gap = input<NullableSize>();

  /** The card the user just picked. */
  readonly activated = output<T>();

  private readonly cards = signal<readonly UniCardOption<T>[]>([]);

  /**
   * Options in document order, however they registered. A card with no
   * `value` is content — a divider, a note — not an option.
   */
  private readonly ordered = computed(() =>
    this.cards()
      .filter((card) => card.value() !== undefined)
      .sort((a, b) =>
        a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      )
  );

  private readonly enabled = computed(() => this.ordered().filter((card) => !card.disabled()));

  /**
   * The card holding the tab stop: the selected one, else the first enabled.
   * Re-seated whenever the value or the options change (a form reset, cards
   * arriving), and moved by the arrow keys in between.
   */
  private readonly focused = linkedSignal<UniCardOption<T> | undefined>(() => {
    const value = this.value();
    const cards = this.enabled();
    return cards.find((card) => card.value() === value) ?? cards[0];
  });

  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  // --- Panel contract, for the cards ----------------------------------------

  register(card: UniCardOption<T>): () => void {
    this.cards.update((cards) => [...cards, card]);
    return () => this.cards.update((cards) => cards.filter((c) => c !== card));
  }

  isSelected(value: T): boolean {
    return this.value() === value;
  }

  isFocusTarget(card: UniCardOption<T>): boolean {
    return this.focused() === card;
  }

  select(value: T, card: UniCardOption<T>): void {
    if (this.disabled() || card.disabled()) return;
    this.value.set(value);
    this.focused.set(card);
    this.activated.emit(value);
  }

  // --- Keyboard ------------------------------------------------------------

  /**
   * The group's keys are the frames'. A key that started inside a card's
   * content — the caret moving in an address field on a ship-to card — is
   * the content's, as the card's own Space and Enter already are.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const cards = this.enabled();
    if (!cards.length || this.disabled()) return;
    if (!this.ordered().some((card) => card.frame() === event.target)) return;
    const current = Math.max(0, cards.indexOf(this.focused() as UniCardOption<T>));
    let next: number | undefined;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (current + 1) % cards.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (current - 1 + cards.length) % cards.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = cards.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const card = cards[next];
    // APG radio: moving selects. The tab index the card reads is a binding, so
    // let it settle before moving focus.
    this.select(card.value() as T, card);
    queueMicrotask(() => card.focus());
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    this.touched.set(true);
    this.touch.emit();
  }

  // --- Styling -------------------------------------------------------------

  protected readonly hostClass = computed(() => {
    const options = this.componentOptions();
    return css([
      this.style(),
      {
        display: 'grid',
        gridTemplateColumns:
          this.templateColumns() ?? options.templateColumns ?? 'repeat(auto-fit, minmax(160px, 1fr))',
        ...this.theme.gap(this.gap() ?? options.gap ?? 'md'),
      },
    ]);
  });
}
