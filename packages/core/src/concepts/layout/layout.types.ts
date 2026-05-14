export type DeviceOrientation = 'portrait' | 'landscape';

export type Display =
  | 'block'
  | 'inline'
  | 'inline-block'
  | 'flex'
  | 'inline-flex'
  | 'grid'
  | 'inline-grid'
  | 'flow-root';
export type OptionalDisplay = Display | undefined;

export type Position = 'relative' | 'absolute' | 'fixed' | 'sticky';
export type OptionalPosition = Position | undefined;

export type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'start'
  | 'end'
  | 'left'
  | 'right';
export type OptionalJustifyContent = JustifyContent | undefined;

export type AlignItems =
  | 'stretch'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'baseline'
  | 'start'
  | 'end'
  | 'self-start'
  | 'self-end';
export type OptionalAlignItems = AlignItems | undefined;

export type AlignContent =
  | 'normal'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch'
  | 'start'
  | 'end'
  | 'baseline';
export type OptionalAlignContent = AlignContent | undefined;

export type AlignSelf = 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
export type OptionalAlignSelf = AlignSelf | undefined;

export type TextAlign =
  | 'center'
  | 'end'
  | 'justify'
  | 'left'
  | 'match-parent'
  | 'right'
  | 'start'
  | 'unset';
export type OptionalTextAlign = TextAlign | undefined;

export type Overflow = 'visible' | 'hidden' | 'scroll' | 'auto';
export type OptionalOverflow = Overflow | undefined;

/* More Flex Options */
export type Flex = number;
export type FlexGrow = number;
export type FlexShrink = number;

export type FlexWrap = 'wrap' | 'nowrap';

export type FlexDirection = 'row' | 'column' | 'column-reverse' | 'row-reverse';
