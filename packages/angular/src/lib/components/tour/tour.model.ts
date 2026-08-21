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
  body: string;
  placement?: Placement;
  backdrop?: 'spotlight' | 'dim' | 'none';
  targetInteractive?: boolean;
  advanceOn?: UniTourAdvance;
}

/** Theme options for the `tour` component entry. */
export interface UniTourOptions {
  progressStyle: 'dots' | 'fraction';
  footerGap: Size;
}
