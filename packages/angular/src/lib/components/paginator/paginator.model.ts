import type { Border, NullableSize, Radius, TextRole } from '@uni-design-system/uni-core';

export interface UniPaginatorOptions {
  gap: NullableSize;
  textRole: TextRole;
  inputBorder: Border;
  inputBorderRadius: Radius;
  pageBorder: Border;
  pageBorderRadius: Radius;
  currentPageBorder: Border;
  currentPageBorderRadius: Radius;
}
