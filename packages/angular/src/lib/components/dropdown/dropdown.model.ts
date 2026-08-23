import type {
  Border,
  ContainerColorToken,
  Motion,
  Radius,
  Shadow,
} from '@uni-design-system/uni-core';

export interface UniDropdownOptions {
  border: Border;
  borderRadius: Radius;
  shadow: Shadow;
  color: ContainerColorToken;
  /** Named motion primitive for the open/close animation. */
  motion: Motion;
}
