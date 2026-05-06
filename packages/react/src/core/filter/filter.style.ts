import { CSSProperties } from 'react';
import { FilterConfig, FilterProps } from './filter.model';
import { FilterType } from './filter.types';
import { FilterConfigs } from './filter.config';

const getFilterConfig = (filterType: FilterType): FilterConfig | undefined => {
  return FilterConfigs[filterType];
};

const getFilterSetting = (type: FilterType, value?: number): string => {
  if (!value) return '';
  const unit = getFilterConfig(type)?.unit;
  return `${type}(${value}${unit && unit !== 'num' ? unit : ''})`;
};

export const FilterStyle = (filterSettings: Partial<FilterProps>): CSSProperties => {
  const filterNames = Object.keys(filterSettings) as FilterType[];

  const filterArray = filterNames.map((type) => getFilterSetting(type, filterSettings[type]));
  console.log(filterArray);
  return { filter: filterArray.join(' ') };
};
