import type { Border, Radius, TextColor, Typeface } from '@uni-design-system/uni-core';

export interface UniMultiSelectDropdownOptions {
  textRole: Typeface;
  textColor: TextColor;
  placeholderTextColor: TextColor;
  dividerBorder: Border;
  searchInputBorder: Border;
  searchInputBorderRadius: Radius;
  focusOutline: string;
  focusOutlineOffset: number;
}
