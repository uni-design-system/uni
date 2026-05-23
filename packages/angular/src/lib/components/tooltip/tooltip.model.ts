import type {
  Border,
  ContainerColorToken,
  Radius,
  Shadow,
  TextRole,
} from '@uni-design-system/uni-core';

export interface UniTooltipOptions {
  color?: ContainerColorToken;
  border?: Border;
  borderRadius?: Radius;
  shadow?: Shadow;
  typeface: TextRole;
}
