import { WritableSignal } from '@angular/core';
import type { Border, Size } from '@uni-design-system/uni-core';
import { Placement } from '../tooltip/tooltip.types';

export interface ButtonGroupConfig {
  tooltipPlacement?: Placement;
  buttonSize: Size;
  buttons: ButtonGroupItem[];
}

export interface ButtonGroupItem {
  symbolName: string;
  selected?: boolean;
  tooltip?: string;
  action?: (selectedState?: boolean) => boolean | void;
  toggle?: WritableSignal<boolean>;
}

/**
 * Theme options for `uni-button-group`. Declared in `ComponentName` since 8.x
 * but with no entry behind it until 11.0.0, so the segmented frame's border
 * and corner radius were hardcoded and unreachable from a theme.
 */
export interface UniButtonGroupOptions {
  /** Border primitive around each segment. Defaults to `quaternary`. */
  border?: Border;
  /** Corner radius on the outer ends of the group, in px. Defaults to 4. */
  borderRadius?: number;
}
