import { FilterType, FilterUnit } from './filter.types';

export interface FilterProps {
  blur?: number;
  brightness?: number;
  contrast?: number;
  grayscale?: number;
  'hue-rotate'?: number;
  invert?: number;
  opacity?: number;
  saturate?: number;
  sepia?: number;
}

export interface FilterConfig {
  type: FilterType;
  value?: number;
  unit?: FilterUnit;
  defaultValue?: number;
  rangeLow?: number;
  rangeHigh?: number;
}
