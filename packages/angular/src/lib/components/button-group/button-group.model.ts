import { WritableSignal } from '@angular/core';
import type { Size } from '@uni-design-system/uni-core';
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
