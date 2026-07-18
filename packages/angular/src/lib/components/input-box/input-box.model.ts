import type {
  Border,
  ColorKey,
  ContainerColorToken,
  OptionalSize,
  Radius,
  Shadow,
  Typeface,
} from '@uni-design-system/uni-core';

export interface UniInputBoxOptions {
  color: ContainerColorToken;
  disabledColor: ContainerColorToken;
  errorColor: ContainerColorToken;
  border: Border;
  errorBorder: Border;
  borderRadius: Radius;
  transitionSpeed: number;
  shadow?: Shadow;
  errorShadow?: Shadow;
  height?: string | number;
  paddingLeft: OptionalSize;
  typeFace: Typeface;
  textColor: ColorKey;
  disabledTextColor: ColorKey;
  focusOutline: string;
  focusOutlineOffset: number;
}
