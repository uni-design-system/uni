import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import {
  UNI_CARD_GROUP,
  type UniCardGroupPanel,
  type UniCardOption,
  type UniCardOptions,
} from './card.model';

/**
 * Content container with a themed frame — and, when asked, a state.
 *
 * `selected` and `interactive` add the `card-selected` and `card-interactive`
 * classes to the frame, which the theme paints (the same contract `uni-tag`
 * has had since 11.1): `selectedBorder`, `selectedColor`, `selectedElevation`
 * and `hoverColor` cover the common case, and a variant's `&.card-selected`
 * rule reaches it for anything else. Inside a `uni-card-group`, a card with a
 * `value` is one of the group's options: a `role="radio"` whose selection and
 * tab stop the group drives.
 *
 * The frame is an Emotion class, not an inline style, because an inline
 * style outranks every class and so no theme rule could ever express a state.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-card',
  imports: [],
  templateUrl: './card.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'card' }],
})
export class UniCardComponent<T = unknown>
  extends BaseComponent<UniCardOptions>
  implements UniCardOption<T>
{
  private readonly group = inject(UNI_CARD_GROUP, { optional: true }) as UniCardGroupPanel<T> | null;
  readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly frame = viewChild.required<ElementRef<HTMLElement>>('frame');

  /**
   * Paint the selected state. Inside a group it is derived from the group's
   * value and this input is ignored.
   */
  readonly selected = input<boolean | undefined>(undefined);

  /**
   * A card the user acts on: a pointer cursor, the theme's hover wash, and
   * `activated` on click, Space or Enter. Always on for an option in a group.
   */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** What this card stands for inside a `uni-card-group`. */
  readonly value = input<T>();

  readonly disabled = input(false, { transform: booleanAttribute });

  /** An interactive card was clicked or activated from the keyboard. */
  readonly activated = output<void>();

  constructor() {
    super();
    if (this.group) {
      const unregister = this.group.register(this);
      inject(DestroyRef).onDestroy(unregister);
    }
  }

  /** One of a group's options: inside a group, with a value to stand for. */
  readonly isOption = computed(() => !!this.group && this.value() !== undefined);

  protected readonly isSelected = computed(() =>
    this.isOption() ? this.group!.isSelected(this.value() as T) : !!this.selected()
  );

  protected readonly isInteractive = computed(() => this.isOption() || this.interactive());

  protected readonly isDisabled = computed(
    () => this.disabled() || (this.isOption() && this.group!.disabled())
  );

  /** The group's roving tab stop; null outside a group. */
  protected readonly tabIndex = computed(() => {
    if (!this.isOption()) return null;
    return this.group!.isFocusTarget(this) ? 0 : -1;
  });

  focus(): void {
    this.frame().nativeElement.focus();
  }

  /**
   * A click on the card's own controls — a link, a button in its content —
   * is theirs, not the card's.
   */
  protected onClick(event: MouseEvent): void {
    if (!this.isInteractive() || this.isDisabled()) return;
    const target = event.target as HTMLElement | null;
    const frame = this.frame().nativeElement;
    const control = target?.closest('a, button, input, select, textarea, label');
    if (control && control !== frame && frame.contains(control)) return;
    this.activate();
  }

  /** Space or Enter on the frame itself; keys inside the content are the content's. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.target !== event.currentTarget) return;
    if (event.key !== ' ' && event.key !== 'Enter') return;
    if (!this.isInteractive() || this.isDisabled()) return;
    event.preventDefault();
    this.activate();
  }

  private activate(): void {
    if (this.isOption()) this.group!.select(this.value() as T, this);
    this.activated.emit();
  }

  /**
   * Token-resolved frame (variant-named border primitive, radii, elevation)
   * under the merged theme style, so hand-authored fixed/variant styles from
   * older themes keep winning — then the states, which the options above
   * describe and a theme's own `&.card-selected` rule can still override
   * through `style()`.
   */
  protected readonly frameClass = computed(() => {
    const options = this.componentOptions();
    const selected = this.isSelected();
    return css([
      this.theme.border(options.border ?? this.variant()),
      this.theme.radius(options.borderRadius),
      this.theme.boxShadow(options.elevation),
      this.style(),
      this.isInteractive() && {
        cursor: 'pointer',
        ...(options.hoverColor && {
          '&:hover': { ...this.theme.colorPair(options.hoverColor) },
        }),
      },
      selected && {
        ...this.theme.border(options.selectedBorder ?? 'primary'),
        ...(options.selectedColor && this.theme.colorPair(options.selectedColor)),
        ...(options.selectedElevation && this.theme.boxShadow(options.selectedElevation)),
      },
      this.isDisabled() && { cursor: 'not-allowed', opacity: 0.6 },
      this.isOption() && {
        outline: 0,
        '&:focus-visible': {
          ...this.theme.focusRingStyle(this.theme.colors()[options.focusRingColor ?? 'primary']),
        },
      },
    ]);
  });

  /** The Emotion class plus the state hooks a theme keys on. */
  protected readonly frameClasses = computed(() =>
    [
      this.frameClass(),
      this.isInteractive() ? 'card-interactive' : '',
      this.isSelected() ? 'card-selected' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );
}
