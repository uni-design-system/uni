import type {
  Backdrop,
  Motion,
  ContainerColorToken,
  Radius,
  Shadow,
  Typeface,
} from '@uni-design-system/uni-core';
import type { IconName } from '../icon/icon.record';

/** Why a callout closed. `programmatic` = the app drove `open` to false. */
export interface UniCalloutDismissal {
  /** The callout's `key`, when one was set — the "don't show again" hook. */
  key?: string;
  reason: 'close-button' | 'escape' | 'backdrop' | 'programmatic';
}

/**
 * Theme options for the `callout` component entry. The spotlight ring color
 * is deliberately not an option — it is the callout's `variant` role.
 */
export interface UniCalloutOptions {
  color: ContainerColorToken;
  borderRadius: Radius;
  shadow: Shadow;
  width: string;
  padding: string;
  headerTypeface: Typeface;
  typeface: Typeface;
  closeIcon: IconName;
  arrowSize: number;
  /** Main-axis gap between the spotlight hole edge and the panel, px. */
  offset: number;
  /** Scrim paint; scheme-invariant by convention, like `::backdrop`. */
  scrimColor: string;
  /**
   * A name from the theme's `backdrops` scale — the one the dialog and the
   * drawer read — so a tour sets the page back exactly as a dialog does.
   * Unset by default; when set it replaces `scrimColor`: its `background` is
   * the scrim's paint and its `backdropFilter` (a frost, a blur) is applied
   * around the spotlight, never over the target. The background must be a
   * plain color: the spotlight paints it as a shadow.
   */
  backdrop?: Backdrop;
  /** Gap between the target's box and the hole edge, px. */
  spotlightPadding: number;
  spotlightRadius: Radius;
  /** Spotlight ring width, px. */
  ringWidth: number;
  /**
   * Width of the fade at the spotlight's edge, px. Unset or 0 keeps the hard
   * edge; a value near `spotlightPadding` fades the scrim out just as it
   * reaches the target. Composes with `ringWidth` (set that to 0 for a ring-
   * less, soft spotlight).
   */
  spotlightFeather?: number;
  /**
   * Named motion primitive for the open/close fade. Defaults to `panel`.
   */
  motion?: Motion;
}
