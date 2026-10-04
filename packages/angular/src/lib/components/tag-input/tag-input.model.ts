import type {
  ContainerColorToken,
  Motion,
  NullableSize,
  Radius,
  Shadow,
  Size,
  TagTone,
  Typeface,
  Variant,
} from '@uni-design-system/uni-core';

/**
 * One committed token. `value` is canonical — what a form submits — and
 * everything else is presentation the field may enrich from a suggestion.
 *
 * `{ value: 'a@b.com' }` is a complete item, so the least a caller has to write
 * is `[value]="[{ value: 'a@b.com' }]"`.
 */
export interface UniTagItem {
  /** Canonical value, e.g. an email address. */
  value: string;
  /** Display text; falls back to `value`. */
  label?: string;
  avatarSrc?: string;
  /** Name the chip draws initials from when there is no image, or it fails. */
  avatarName?: string;
  /**
   * Failed `validate()`. The item stays **in** the value rather than being
   * rejected — a field that silently swallows a typo'd address is worse than
   * one that shows it in red, and the user can click in to fix it.
   */
  invalid?: boolean;
  /** Locked token (e.g. a thread owner): rendered without a remove control. */
  disabled?: boolean;
}

/** A type-ahead entry. Same contract as `uni-search-input`: the app filters. */
export interface UniTagSuggestion {
  value: string;
  label?: string;
  /** Painted under the label in the default row. */
  description?: string;
  avatarSrc?: string;
  /** Initials lead for the row and the chip when there is no image. */
  avatarName?: string;
  /**
   * Heading shown above the first of each run of suggestions sharing it. The
   * field does not sort — order the suggestions so groups are contiguous.
   */
  group?: string;
}

/** Context of a `uniTagSuggestion` row template. */
export interface UniTagSuggestionContext {
  $implicit: UniTagSuggestion;
  index: number;
  /** The keyboard-active (or hovered) row. */
  active: boolean;
}

/** Why a typed token did not become a chip. */
export interface UniTagRejection {
  raw: string;
  reason: 'duplicate' | 'max' | 'invalid';
}

/** Theme options for the `tagInput` component entry. */
export interface UniTagInputOptions {
  /** Space between chips. */
  chipGap?: NullableSize;
  chipSize?: Size;
  /** Chip colour role when `tagVariant` is not bound. Defaults to `primary`. */
  chipVariant?: Variant;
  /** Chip archetype when `tagTone` is not bound. Defaults to `soft`. */
  chipTone?: TagTone;
  /** Keeps the text input usable when chips have wrapped. */
  minInputWidth?: string | number;
  listColor?: ContainerColorToken;
  listShadow?: Shadow;
  listBorderRadius?: Radius;
  /** Active/hover suggestion fill; the on-color pair is derived. Must
      contrast with `listColor` or keyboard navigation turns invisible. */
  activeColor?: ContainerColorToken;
  maxSuggestions?: number;
  /** Named motion primitive for the suggestion popup's open animation.
      Defaults to `popup` — the token `uni-dropdown` uses. */
  motion?: Motion;
  /** Suggestion text role. Defaults to `label`. */
  typeface?: Typeface;
  /** Group heading text role. Defaults to `caption`. */
  headingTypeface?: Typeface;
  /** Popup width: `anchor` (default) matches the field; a length is clamped by it. */
  listWidth?: 'anchor' | string | number;
}
