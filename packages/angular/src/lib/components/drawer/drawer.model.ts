import { InjectionToken, type Signal } from '@angular/core';
import type {
  Border,
  ContainerColorToken,
  Elevation,
  Motion,
  OptionalSize,
  StyleExpression,
} from '@uni-design-system/uni-core';

/** How the drawer coexists with page content. */
export type DrawerMode = 'side' | 'over';

/** Which edge the drawer attaches to (logical: start = left in LTR). */
export type DrawerPosition = 'start' | 'end';

/** Surface treatment of the panel behind its content. */
export type DrawerBackground = 'solid' | 'glass' | 'gradient';

/** Why the drawer is asking to close. */
export type DrawerCloseReason = 'close-button' | 'escape' | 'backdrop';

/**
 * Emitted by `closeRequest` before the drawer closes. The drawer is *asking*;
 * with `disableAutoClose` set it will not act on its own, leaving the consumer
 * free to run an async confirmation and set `open` when it resolves.
 */
export interface UniDrawerCloseRequest {
  reason: DrawerCloseReason;
}

/**
 * The slice of the drawer its header and footer rows need.
 *
 * A token rather than the component class on purpose: the drawer renders a
 * `[uni-drawer-header]` itself when given a `headline`, so importing the
 * component class in both directions would be a cycle.
 */
export interface UniDrawerPanel {
  readonly headline: Signal<string | undefined>;
  readonly defaultCloseButton: Signal<boolean>;
  readonly titleId: string;
  readonly hasHeader: { set(value: boolean): void };
  requestClose(reason: DrawerCloseReason): void;
}

export const DRAWER_PANEL = new InjectionToken<UniDrawerPanel>('uni-drawer-panel');

/** Theme-level options for `uni-drawer`, resolved by token name. */
export interface UniDrawerOptions {
  /** Panel surface color token (with its paired on-color). */
  color?: ContainerColorToken;
  /** Panel width in px. */
  width?: number;
  /** Edge rule separating a side drawer from content, as a border primitive. */
  divider?: Border;
  /** Elevation shadow token. Overlay mode only — see `background`. */
  elevation?: Elevation;
  /**
   * Inner padding of the *body* row, as a spacing token. The panel itself is
   * unpadded so that header and footer rows can pin flush to its edges.
   */
  padding?: OptionalSize;
  /** Backdrop styling for the overlay mode. Ignored when `scrim` is false. */
  backdrop?: StyleExpression;
  /**
   * Whether the overlay mode dims the page behind it. False leaves
   * `::backdrop` transparent — the drawer still traps focus and is still
   * modal, it simply does not darken what it covers.
   */
  scrim?: boolean;
  /** Surface treatment of the panel. */
  background?: DrawerBackground;
  /**
   * Timing for everything the panel does: the overlay's slide, its scrim's
   * fade, and the side panel's width transition. One token for all three, so
   * the scrim can never drift out of step with the panel it dims.
   */
  motion?: Motion;
}
