import { CSSProperties } from 'react';
import { HorizontalAlign, VerticalAlign } from '@uni-design-system/uni-core';

export const flex: CSSProperties = { flex: 1 };

export const row: CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: 'row'
};

export const column: CSSProperties = {
  flex: 1,
  flexDirection: 'column'
};

export const alignTop: CSSProperties = { alignItems: 'flex-start' };
export const alignCenter: CSSProperties = { alignItems: 'center' };
export const alignBottom: CSSProperties = { alignItems: 'flex-end' };

export const FlexVerticalAlignments: Record<VerticalAlign, CSSProperties> = {
  top: alignTop,
  middle: alignCenter,
  bottom: alignBottom
};

export const justifyLeft: CSSProperties = { justifyContent: 'flex-start' };
export const justifyCenter: CSSProperties = { justifyContent: 'center' };
export const justifyRight: CSSProperties = { justifyContent: 'flex-end' };

export const FlexHorizontalAlignments: Record<HorizontalAlign, CSSProperties> = {
  left: justifyLeft,
  center: justifyCenter,
  right: justifyRight
};

export const expand: CSSProperties = { flexGrow: 1 };
export const fix: CSSProperties = { flex: 0, flexGrow: 0 };

export const rowFlexItem: CSSProperties = {
  flexGrow: 1
};

export const rowFixedItem: CSSProperties = {
  flexGrow: 0
};

export const flexRowStart: CSSProperties = {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center'
};

export const flexRowCenter: CSSProperties = {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center'
};

export const flexRowEnd: CSSProperties = {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center'
};

export const spaceBetween: CSSProperties = {
  justifyContent: 'space-between'
};

export const flexRowSpaceBetween: CSSProperties = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
};

export const flexRowSpaceAround: CSSProperties = {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center'
};

export const spaceEvenly: CSSProperties = {
  justifyContent: 'space-evenly'
};

export const flexRowSpaceEvenly: CSSProperties = {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center'
};

export const flexColumnCenter: CSSProperties = {
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
};

export const flexColumnSpaceAround: CSSProperties = {
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center'
};

export const flexOff: CSSProperties = {
  position: 'relative'
};
