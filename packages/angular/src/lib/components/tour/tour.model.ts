import type { Size } from '@uni-design-system/uni-core';
import type { Placement } from '../../cdk';

/**
 * Advances a step from an interaction on its target instead of the Next
 * button. `auto` advances the moment the event fires; it defaults to true for
 * `click` (the gesture is complete) and false otherwise (mid-typing must not
 * yank the user forward — Next unlocks instead).
 */
export interface UniTourAdvance {
  event: string;
  auto?: boolean;
}

export interface UniTourStep {
  key: string;
  /** Element or id to spotlight; omit for a centered, page-dimming step. */
  target?: HTMLElement | string;
  title: string;
  /** Omit for a title-only pointer; no paragraph is rendered. */
  body?: string;
  placement?: Placement;
  backdrop?: 'spotlight' | 'dim' | 'none';
  targetInteractive?: boolean;
  advanceOn?: UniTourAdvance;
}

/** Theme options for the `tour` component entry. */
export interface UniTourOptions {
  /**
   * How the footer counts steps. `none` draws no progress; a one-step tour
   * never draws any. The component's `progressStyle` input overrides it.
   */
  progressStyle: 'dots' | 'fraction' | 'none';
  footerGap: Size;
}
