import type {
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
  closeSymbol: IconName;
  arrowSize: number;
  /** Main-axis gap between the spotlight hole edge and the panel, px. */
  offset: number;
  /** Scrim paint; scheme-invariant by convention, like `::backdrop`. */
  scrimColor: string;
  /** Gap between the target's box and the hole edge, px. */
  spotlightPadding: number;
  spotlightRadius: Radius;
  /** Spotlight ring width, px. */
  ringWidth: number;
  transitionMs: number;
}
