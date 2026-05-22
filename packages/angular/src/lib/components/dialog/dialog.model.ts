import type {
  Border,
  ContainerColorToken,
  Elevation,
  NullableSize,
  Radius,
  StyleExpression,
} from '@uni-design-system/uni-core';

export interface UniDialogOptions {
  border: Border;
  borderRadius: Radius;
  color: ContainerColorToken;
  elevation: Elevation;
  backdrop: StyleExpression;
  padding?: NullableSize;
}
