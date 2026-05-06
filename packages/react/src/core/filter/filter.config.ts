import { FilterConfig } from './filter.model';
import { FilterType } from './filter.types';

export const FilterConfigs: Record<FilterType, FilterConfig> = {
  blur: {
    type: 'blur',
    unit: 'px',
    defaultValue: 4,
    rangeLow: 0,
    rangeHigh: 100,
  },
  brightness: {
    type: 'brightness',
    unit: '%',
    defaultValue: 250,
    rangeLow: 0,
    rangeHigh: 100,
  },
  contrast: {
    type: 'contrast',
    unit: '%',
    defaultValue: 180,
    rangeLow: 0,
    rangeHigh: 100,
  },
  grayscale: {
    type: 'grayscale',
    unit: '%',
    defaultValue: 100,
    rangeLow: 0,
    rangeHigh: 100,
  },
  'hue-rotate': {
    type: 'hue-rotate',
    unit: 'deg',
    defaultValue: 180,
    rangeLow: 0,
    rangeHigh: 360,
  },
  invert: {
    type: 'invert',
    unit: '%',
    defaultValue: 100,
    rangeLow: 0,
    rangeHigh: 100,
  },
  opacity: {
    type: 'opacity',
    unit: '%',
    defaultValue: 50,
    rangeLow: 0,
    rangeHigh: 100,
  },
  saturate: {
    type: 'saturate',
    unit: 'num',
    defaultValue: 7,
    rangeLow: 0,
    rangeHigh: 100,
  },
  sepia: {
    type: 'sepia',
    unit: '%',
    defaultValue: 100,
    rangeLow: 0,
    rangeHigh: 100,
  },
};
