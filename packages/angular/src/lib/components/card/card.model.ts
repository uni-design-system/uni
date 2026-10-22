import { InjectionToken, type Signal } from '@angular/core';
import type {
  Border,
  ColorKey,
  ContainerColorToken,
  Elevation,
  NullableSize,
  Radius,
  Variant,
} from '@uni-design-system/uni-core';

/** Theme-level options for `uni-card`, resolved by token name. */
export interface UniCardOptions {
  defaultVariant?: Variant;
  /** Corner radius as a radii token. The default theme uses `xs`. */
  borderRadius?: Radius;
  /**
   * Frame as a border primitive token. When unset, the card follows its
   * variant — `borders.primary`, `borders.warn`, … — so redefining a border
   * primitive restyles every card (and every other component) sharing it.
   */
  border?: Border;
  /** Optional elevation shadow token; cards are flat by default. */
  elevation?: Elevation;
  /**
   * Frame of a selected card, as a border primitive. Defaults to `primary`,
   * so a picked card reads as picked under any variant.
   */
  selectedBorder?: Border;
  /** Surface of a selected card (with its on-color). Unset keeps the card's own. */
  selectedColor?: ContainerColorToken;
  /** Elevation of a selected card. Unset keeps `elevation`. */
  selectedElevation?: Elevation;
  /** Surface of an interactive card under the pointer. Unset: no hover wash. */
  hoverColor?: ContainerColorToken;
  /** Keyboard-focus ring colour of a card that is an option. Defaults to `primary`. */
  focusRingColor?: ColorKey;
}

/** Theme-level options for `uni-card-group`. */
export interface UniCardGroupOptions {
  /** Space between cards, as a spacing token. Defaults to `md`. */
  gap?: NullableSize;
  /** The grid's `grid-template-columns`. Defaults to `repeat(auto-fit, minmax(160px, 1fr))`. */
  templateColumns?: string;
}

/**
 * What a card inside a group needs from it: whether the card's value is the
 * selected one, whether the card holds the group's tab stop, and the one
 * place a selection is decided. A token rather than the component class so
 * the card does not import the group that imports it.
 */
export interface UniCardGroupPanel<T = unknown> {
  readonly disabled: Signal<boolean>;
  isSelected(value: T): boolean;
  isFocusTarget(card: UniCardOption<T>): boolean;
  select(value: T, card: UniCardOption<T>): void;
  /** Register a card; returns the matching unregister. */
  register(card: UniCardOption<T>): () => void;
}

/** The slice of a card the group drives. */
export interface UniCardOption<T = unknown> {
  readonly value: Signal<T | undefined>;
  readonly disabled: Signal<boolean>;
  readonly element: HTMLElement;
  focus(): void;
}

export const UNI_CARD_GROUP = new InjectionToken<UniCardGroupPanel>('uni-card-group');
