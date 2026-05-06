import { FilterConfigs } from './filter.config';
const getFilterConfig = (filterType) => {
    return FilterConfigs[filterType];
};
const getFilterSetting = (type, value) => {
    if (!value)
        return '';
    const unit = getFilterConfig(type)?.unit;
    return `${type}(${value}${unit && unit !== 'num' ? unit : ''})`;
};
export const FilterStyle = (filterSettings) => {
    const filterNames = Object.keys(filterSettings);
    const filterArray = filterNames.map((type) => getFilterSetting(type, filterSettings[type]));
    console.log(filterArray);
    return { filter: filterArray.join(' ') };
};
