import type {
  IconName,
  Motion,
  NullableSize,
  Radius,
  Size,
  TagTone,
  Typeface,
  Variant,
} from '@uni-design-system/uni-core';

/** Theme options for the `tag` component entry. */
export interface UniTagOptions {
  /** Named motion primitive for the fill and ink transition. Defaults to `control`. */
  motion?: Motion;
  borderRadius?: Radius;
  typeface?: Typeface;
  /** Space between the lead element, label and remove button. */
  gap?: NullableSize;
  /** Icon primitive for the remove affordance. */
  removeIcon?: IconName;
  /** Icon primitive shown in the lead slot when the chip is selected. */
  selectedIcon?: IconName;
  /**
   * How far a lead element or the remove control tucks into the chip's rounded
   * end, in px. Defaults to `auto`, which derives it from the chip so the lead
   * sits concentric with the cap — and which declines to tuck at all when the
   * end is too square to flow into.
   */
  endInset?: number | 'auto';
}

/** The value a tag echoes back on `removed` / `activated`. */
export type UniTagValue = string | number | undefined;

/**
 * One chip in a {@link UniTagGroupComponent}. The group renders its own chips
 * rather than projecting them, which is what lets it drive `selected` and the
 * roving tab index without an app binding per chip.
 */
export interface UniTagGroupItem<T extends UniTagValue = UniTagValue> {
  label: string;
  value: T;
  /** Colour role, overriding the group's own. */
  variant?: Variant;
  /** Style archetype, overriding the group's own. */
  tone?: TagTone;
  iconName?: IconName;
  symbolName?: string;
  avatarSrc?: string;
  /** Initials fallback when `avatarSrc` is absent or fails to load. */
  avatarName?: string;
  dot?: boolean;
  disabled?: boolean;
  /** Adds a remove control to this chip; the group re-emits it on `removed`. */
  removable?: boolean;
  /** Truncation budget, e.g. `'14ch'`. A number is treated as px. */
  maxWidth?: string | number;
}

/** Theme options for the `tagGroup` component entry. */
export interface UniTagGroupOptions {
  /** Space between chips in a row. Defaults to `xs`. */
  gap?: NullableSize;
  /** Space between wrapped rows. Defaults to `xs`. */
  rowGap?: NullableSize;
  /** Size every chip takes unless the group's `size` input says otherwise. */
  chipSize?: Size;
  /** Resting tone for every chip. */
  chipTone?: TagTone;
  /** Colour role for every chip. */
  chipVariant?: Variant;
}
