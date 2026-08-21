import type { ContainerColorToken, NullableSize, Radius, Shadow, Size } from '@uni-design-system/uni-core';

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
  description?: string;
  avatarSrc?: string;
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
  /** Keeps the text input usable when chips have wrapped. */
  minInputWidth?: string | number;
  listColor?: ContainerColorToken;
  listShadow?: Shadow;
  listBorderRadius?: Radius;
  /** Active/hover suggestion fill; the on-color pair is derived. Must
      contrast with `listColor` or keyboard navigation turns invisible. */
  activeColor?: ContainerColorToken;
  maxSuggestions?: number;
}
