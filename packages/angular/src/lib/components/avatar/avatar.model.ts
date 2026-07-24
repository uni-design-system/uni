import type { ColorKey, OptionalSize, Radius, Typeface } from '@uni-design-system/uni-core';

/** Theme-level options for `uni-avatar`, resolved by token name. */
export interface UniAvatarOptions {
  /** Corner radius token — `max` renders circles; `sharp` themes get squares. */
  borderRadius?: Radius;
  /** Typeface token for the initials. */
  typeface?: Typeface;
  /** Symbol shown when there is no image and no name to take initials from. */
  fallbackSymbol?: string;
}

/** Theme-level options for `uni-avatar-group`. */
export interface UniAvatarGroupOptions {
  /** How far stacked avatars overlap, as a spacing token. */
  overlap?: OptionalSize;
  /** Ring color separating stacked avatars from each other. */
  ringColor?: ColorKey;
  /** Ring width in px. */
  ringWidth?: number;
}
